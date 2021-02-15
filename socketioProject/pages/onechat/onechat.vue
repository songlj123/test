<template>
	<view class="content">
		<!--<button @tap="viewAllUsers">查看群内成员</button>
		<view v-if="showView" class="backgroundview">
			<view class="userlistView" v-for="(item,index) in userlist" :key='index'>
				<image src="../../static/logo.png" @tap="beginChat(item)"/>
				<text>{{item}}</text>
			</view>
		</view>-->
		<view v-for="(item,index) in msglist" :key="index" class="container">
			<view v-if="!item.commonmsg&&item.name===name" class="dialogue">
				<view class="icon">
					<image class="avatar" src="/static/logo.png"/>
					<text>{{item.name}}</text>
				</view>
				<text class="frame">{{item.text}}</text>
			</view>
			<view v-if="!item.commonmsg&&item.name!==name" class="mydialogue">
				<view class="icon">
					<image class="avatar" src="/static/logo.png"/>
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
			console.log(e.myname,e.name,"load")
			uni.setNavigationBarTitle({
				title:"与"+e.name+"的私人聊天室"
			})
			this.name=e.myname;
			this.tid=e.name
			//this.joinGroup(e.name)
			//console.log(this.$socket._callbacks.$onemsg,this.$socket._callbacks.$gbmsg)
			this.$socket.removeListener("onemsg")//先取消监听，防止重复监听
			this.getGbmsg()
			//console.log(this.$socket)
			this.msglist =localStorage.getItem(this.name+'to'+this.tid)?JSON.parse(localStorage.getItem(this.name+'to'+this.tid)):[],
			this.msglist.push({text:this.name+"进入了私人聊天室",commonmsg:true,name:this.name})
			this.$socket.emit("onemessager",this.name+"进入了私人聊天室",this.tid,this.name,true)
		},
		onUnload(){
			//this.$socket.removeListener('onemsg');
			console.log(this.name,this.tid,"unload")
			this.msglist.push({text:this.name+"退出了私人聊天室",commonmsg:true,name:this.name})
			localStorage.setItem(this.name+'to'+this.tid,JSON.stringify(this.msglist))
			this.$socket.emit("onemessager",this.name+"退出了私人聊天室",this.tid,this.name,true)
		},
		methods: {
			async submitmsg(){
				if(this.currentMsg.length>0){
					this.$socket.emit("onemessager",this.currentMsg,this.tid,this.name,false)
					this.msglist.push({text:this.currentMsg,commonmsg:false,name:this.name})
					//commonmsg分辨是否公共消息，比如谁谁谁加入了群聊，谁谁谁退出了群聊，name表明是谁发的消息，以便区分对话框位置
					
					console.log(this.name,'to',this.tid,this.currentMsg)
					localStorage.setItem(this.name+'to'+this.tid,JSON.stringify(this.msglist))
					//if(this.$socket._callbacks.$onemsg)
					this.currentMsg=""
					let result = await this.$request("/getListener",{socketname:this.tid})
					if(!result.data.data){//对方socket未有监听事件
						localStorage.setItem(this.tid+'to'+this.name,JSON.stringify(this.msglist))
					}
				}
				
			},
			getGbmsg:function(){
				this.$socket.on("onemsg",(data,name,common)=>{ 	
					//console.log("ade",name)
					console.log(this.$socket.id,this.name,'from',this.tid,name,data)
					if(name === this.tid){//解决当a在与c对话窗口时，b发私聊给a，导致b与a的对话展现在a与c的对话框中
						this.msglist.push({text:data,commonmsg:common,name:name})
						localStorage.setItem(this.name+'to'+name,JSON.stringify(this.msglist))
					}else{
						
						let charRecord={}
						if(localStorage.getItem(this.name+'to'+name)){
							charRecord = JSON.parse(localStorage.getItem(this.name+'to'+name))
							localStorage.setItem(this.name+'to'+name,JSON.stringify([...charRecord,{text:data,commonmsg:common,name:name}]))
						}else{
							localStorage.setItem(this.name+'to'+name,JSON.stringify([{text:data,commonmsg:common,name:name}]))
						}
					}
					//console.log(this.msglist,"getgbmsg")   
					
				});
				/*this.$socket.on("onequit",()=>{
					//this.userlist = userlist
					//this.member=members
					console.log(this.name,"quit")
					this.msglist.push({text:name+"退出了与你的私人对话",commonmsg:true,name:this.tid})
					localStorage.setItem(this.name+'to'+this.tid,JSON.stringify(this.msglist))
					
				});*/
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
