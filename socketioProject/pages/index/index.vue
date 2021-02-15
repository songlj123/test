<template>
	<view class="content">
		<button @tap="viewAllUsers">查看群内成员</button>
		<view v-if="showView" class="backgroundview">
			<view class="userlistView" v-for="(item,index) in userlist" :key='index'>
				<image src="../../static/logo.png" @tap="beginChat(item)"/>
				<text>{{item}}</text>
			</view>
		</view>
		<view v-for="(item,index) in msglist" :key="index" class="container">
			<view v-if="!item.commonmsg&&item.name===name" class="dialogue">
				<view class="icon">
					<image class="avatar" src="/static/logo.png" @tap="beginChat(item.name)"/>
					<text>{{item.name}}</text>
				</view>
				<text class="frame">{{item.text}}</text>
			</view>
			<view v-if="!item.commonmsg&&item.name!==name" class="mydialogue">
				<view class="icon">
					<image class="avatar" src="/static/logo.png" @tap="beginChat(item.name)"/>
					<text>{{item.name}}</text>
				</view>
				<text class="frame">{{item.text}}</text>
			</view>
			<view v-if="item.commonmsg" style="text-align: center;font-size: 12rpx;">{{item.text}}</view>
		</view>
		<view class="text-area">
			<input type='text'    v-model="currentMsg"/>
			<button @tap="submitmsg">submit</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				msglist:[],
				currentMsg:"",
				member:0,
				name:"",
				userlist:[],
				showView:false
			}
		},
		onLoad(e) {
			console.log(e.name,"onload")
			if(!this.$socket.connected){
				this.$socket.connect()
			}
			this.name=e.name
			this.getGbmsg()
			this.joinGroup(e.name)
			
			this.msglist =localStorage.getItem("group"+this.name)?JSON.parse(localStorage.getItem("group"+this.name)):[]
		},
		onUnload(){
			this.$socket.removeListener("gbmsg")
			this.$socket.removeListener("member")
			this.$socket.removeListener("quit")
			this.$socket.removeListener("onemsg")
			this.$socket.disconnect()
			console.log(this.name,"unload")
		},
		methods: {
			beginChat(name){
				if(this.name===name){
					uni.showToast({
						title:"不能发起与自己的对话"
					})
				}else if(this.userlist.length==2){
					uni.showToast({
						title:"目前群聊中只有对方，无需另外发起对话"
					})
				}else{
					//console.log(111)
					uni.navigateTo({
						url:"../onechat/onechat?name="+name+"&myname="+this.name
					})
				}
			},
			viewAllUsers(){
				
				this.showView=!this.showView;
				//console.log(this.showView)
			},
			joinGroup(name){
				console.log("join")
				this.$socket.emit("joingroup",name)
			},
			async submitmsg(){
				if(this.currentMsg.length>0){
					this.$socket.emit("messager",this.currentMsg,this.name)
					this.msglist.push({text:this.currentMsg,commonmsg:false,name:this.name})
					//commonmsg分辨是否公共消息，比如谁谁谁加入了群聊，谁谁谁退出了群聊，name表明是谁发的消息，以便区分对话框位置
					
					//console.log(this.msglist,"submitmsg")
					localStorage.setItem("group"+this.name,JSON.stringify(this.msglist))
					
					let result = await this.$request("/getOfflineUsers")
					if(result.data.data.length>0){//对方socket未有监听事件
						result.data.data.forEach((item,index)=>{
							console.log("foreach",this.name)
							let charRecord = JSON.parse(localStorage.getItem("group"+item))
							localStorage.setItem("group"+item,JSON.stringify([...charRecord,{text:this.currentMsg,commonmsg:false,name:this.name}]))
						})
					}
					this.currentMsg=""
				}
				
			},
			getGbmsg:function(){
				console.log("getgbmsg")
				this.$socket.on("gbmsg",(data,name)=>{
					 
					
					this.msglist.push({text:data,commonmsg:false,name:name})
					//console.log(this.msglist,"getgbmsg")   
					localStorage.setItem("group"+this.name,JSON.stringify(this.msglist))
				});
				this.$socket.on("member",(arg1,arg2,arg3)=>{
					
					this.userlist = arg3
					this.member=arg1;
					this.msglist.push({text:arg2+"加入了群聊",commonmsg:true,name:arg2})
					localStorage.setItem("group"+this.name,JSON.stringify(this.msglist))
					console.log(this.msglist,arg1,JSON.stringify(arg3))  
				});
				this.$socket.on("quit",(name,members,userlist)=>{
					this.userlist = userlist
					this.member=members
					this.msglist.push({text:name+"退出了群聊",commonmsg:true,name:name})
					localStorage.setItem("group"+this.name,JSON.stringify(this.msglist))
				});
			}
		},
		watch:{
			member(){
				uni.setNavigationBarTitle({
					title:this.name+"的聊天室(在线"+this.member+"人)"
				})
			}
		}
	}
</script>

<style lang="scss">
	.backgroundview{
		width:100%;
		/*height:100rpx;*/
		background-color: #ccc;
		display: flex;
		flex-wrap: wrap;
		flex-direction: row;
		.userlistView{
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			margin-right: 10rpx;
			margin-bottom: 10rpx;
			image{
				width:60rpx;
				height:60rpx;
				border-radius: 50%;
			}	
		}
	}
	
	.content{
		padding-bottom:150rpx;
	}
	.container{
		margin-bottom:50rpx;
	}
	.dialogue{
		display: flex;
		flex-direction: row-reverse;
		
		.frame{
			background-color:#ccc;
			border-radius: 10rpx;
			position: relative;
			width:30%;
			word-break:break-all;   
			&::after{
				content:"";
				display: block;
				position: absolute;
				top:10rpx;
				right:-18rpx;
				border:10rpx solid transparent;
				border-left-color: #ccc;
			}
		}
		.icon{
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			font-size: 14rpx;
			text{
				text-align:center;
				width:60rpx;
				margin-left:20rpx;
			} 
			.avatar{
				width:60rpx;
				height:60rpx;
				border-radius: 30rpx;
				margin-left:20rpx;
			}
		}
		
		
	}
	.mydialogue{
		display: flex;
		.icon{
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			font-size: 14rpx;
			text{
				text-align:center;
				width:60rpx;
				margin-right:20rpx;
			} 
			.avatar{
				width:60rpx;
				height:60rpx;
				border-radius: 30rpx;
				margin-right:20rpx;
			}
		}
		.frame{
			background-color:#ccc;
			border-radius: 10rpx;
			position: relative;
			width:30%;
			&::before{
				content:"";
				display: block;
				position: absolute;
				top:10rpx;
				left:-18rpx;
				border:10rpx solid transparent;
				border-right-color: #ccc;
			}
		}
		
	}

	.text-area {
		position:fixed;
		bottom:50rpx;
		left:10rpx;
		width:100%;
		height:100rpx;
		z-index:2;
		input{
			border:1rpx solid #4CD964;
			width:95%;
			margin:10rpx auto;
			z-index:2;
		}
	}


</style>
