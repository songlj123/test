const baseUrl = "http://localhost:3000"
//const baseUrl = "http://songljqyc.cn.utools.club"
export default function request(url,requestdata={},method='get'){
	return new Promise((resolve,reject)=>{
		uni.request({
			success: (data) => {
				resolve(data)
			},
			fail: () => {
				uni.showToast({
					title:'get failed'
				})
			},
			data:requestdata,
			method:method,
			url:baseUrl+url
			
		})
	})
}