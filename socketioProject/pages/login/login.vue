<template>
	<view class="content">
		<view class="background"></view>
		<input class="input" type="text" v-model="name"/>
		<view class="container">
			<text class="text-area" @tap="joinGroup">join</text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				name:""
			}
		},
		onLoad() {
			//this.getGbmsg()
		},
		methods: {
			joinGroup(){
				if(this.name){
					uni.navigateTo({
						url:"../index/index?name="+this.name+"&imgurl=logo.png"
					})
				}else{
					uni.showToast({
						title:"请输入昵称"
					})
				}

				
			},
			getGbmsg:function(){
				this.$socket.on("gbmsg",(data)=>{
					//console.log(this.msglist,data)
					this.msglist.push(data)
				})
			}
		}
	}
</script>

<style>
	.input{
		border:1rpx solid #4CD964;
		width:200rpx;
		height:100rpx;
		margin:0 auto;
	}
	.container{
		text-align: center;
		padding:100rpx;
	}
	.text-area {
		background-color: #4CD964;
		border:1rpx solid #C0C0C0;
		display:inline-block;
		width:100rpx;
		height:100rpx;
		border-radius: 50rpx;
		text-align: center;	
		line-height: 100rpx;
	}
	.background{
		width:200rpx;
		height:200rpx;
		border-radius: 100rpx;
		background-image: url(../../static/logo.png);
		background-repeat: no-repeat;
		background-size: 100% 100%;
		display: block;
		margin:20rpx auto;
	}


</style>
