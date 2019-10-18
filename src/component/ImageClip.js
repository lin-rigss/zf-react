import React from 'react';


// 图片裁切组件 
class ImageClip extends React.Component {
	constructor(props) {
		super(props);

		//=>初始化CANVAS和MARK的大小和位置
		let winW = document.documentElement.clientWidth,   // 页面的W
			ratio = window.ratio; // rem 转 px 的一个比例 
		let W = winW - .4 * ratio,  // canvas画布 W 
			H = W, //  因为画布是正方形的  所以 H=W
			MW = W * .7,  // mask W  占画布的 7
			MH = MW,      // mask H
			ML = (W - MW) / 2,  // 让 mask 居中显示，所以设置 Left   top 
			MT = (H - MH) / 2;
		this.state = {
			W, H, MW, MH, ML, MT,
			S: false    // 控制mask 显示和隐藏的 状态 
		};
	}

	render() {
		let { W, H, MW, MH, MT, ML, S } = this.state;

		return <div className="clipImageBox">
			<div className="canvasBoxDiv"

				// 移动端的拖拽   按下开始时
				onTouchStart={ev => {
					// 记录 手指起始位置
					let point = ev.changedTouches[0]; // 是一个集合，只获取第一个
					this.startX = point.clientX;
					this.startY = point.clientY;
				}}
				// 移动时
				onTouchMove={ev => {
					//  获取移动时当前的位置
					let point = ev.changedTouches[0];
					let changeX = point.clientX - this.startX,
						changeY = point.clientY - this.startY;
					// 判断偏移值 移动误差 
					if (Math.abs(changeX) > 10 || Math.abs(changeY) > 10) {
						this.IL += changeX; //  将移动的距离设置给图片的Left  top 
						this.IT += changeY;
						this.drawImage();
						// 每次移动结束 都让 startX Y 回归初始值 
						this.startX = point.clientX;
						this.startY = point.clientY;
					}
				}}
			>
				{/* canvas画布 */}
				<canvas className="canvasBox"
					ref={x => this._canvas = x}
					width={W}
					height={H}
				></canvas>

				{/* mark */}
				<div className="mark"
					style={{
						width: MW + 'px',
						height: MH + 'px',
						left: ML + 'px',
						top: MT + 'px',
						display: S ? 'block' : 'none'
					}}
				></div>
			</div>

			{/* 操作区  */}
			<div className="buttonBox">
				{/* 选择图片的 input   规定了选择文件的格式 */}
				<input type="file" accept="image/*" className="file"
					ref={x => this._file = x}
					onChange={this.fileChange} />
				{/* 使用 ref获取这个元素   并设置 一个onChange方法  使用下面的按钮来触发 change方法*/}
				<button className="choose"
					onClick={ev => {
						this._file.click();
					}}
				>选择图片</button>

				<button onClick={ev => {
					if (!this.img) return;
					this.IW += 10;
					this.IH += 10;
					this.drawImage();
				}}>放大</button>
				<button onClick={ev => {
					if (!this.img) return;
					this.IW -= 10;
					this.IH -= 10;
					this.drawImage();
				}}>缩小</button>

				{/* 裁切  保存图片  */}
				<button className="submit" onClick={ev => {
					if (!this.img) return;
					//                       获取mask 区域的图片
					let imagedata = this.ctx.getImageData(ML, MT, MW, MH),
						// 创建新的canvas  将获取到的截取图片 绘制到新的canvas中  使用.putImageData(数据，放在画布中的X，Y ， 图片的XY，图片宽高)
						canvas2 = document.createElement('canvas'),
						ctx2 = canvas2.getContext('2d');
					canvas2.width = MW;
					canvas2.height = MH;
					ctx2.putImageData(imagedata, 0, 0, 0, 0, MW, MH);
					//  toDataURL（‘指定格式 ’）将这个传给change方法
					this.props.change(canvas2.toDataURL("image/png"));
				}}>保存图片</button>
			</div>
		</div>;
	}

	//=>获取上传的图片，最后能把图片渲染到CANVAS中
	fileChange = () => {
		this.setState({ S: true });
		let picOM = this._file.files[0]; // 获取上传的一张图息信息  （是一个对象）
		if (!picOM) return;
		//=>从获取的文件对象中读取出图片的数据（获取到当前图片的BASE64码）
		let fileReade = new FileReader();  //  使用 这个类 来进行转换  
		fileReade.readAsDataURL(picOM); // 使用 类上的一个方法 将获取的图片转成 BASE64码
		fileReade.onload = ev => {
			//=>创建一张图片
			this.img = new Image();
			this.img.src = ev.target.result; // 将ev.target.result 将BASE64码放到一个新图片中
			this.img.onload = () => {
				// 图片的宽 和高 需要 和canvas的画布 有一定的比例 

				let n = 1, // 缩放比例
					{ W, H } = this.state;
				this.IW = this.img.width;  // 选中图片的W  H
				this.IH = this.img.height;
				// 判断 如果图片的宽大于高  就让canvas画布的宽等于图片的宽 ， 高度按n 的比例进行缩放
				if (this.IW > this.IH) {
					n = this.IW / W;
					this.IW = W;
					this.IH = this.IH / n;
				} else {
					// 宽不大于高  就是小于高， 同样，让canvas画布的高等于图片的高， 宽按n 的比例缩放
					n = this.IH / H;
					this.IH = H;
					this.IW = this.IW / n;
				}

				// 未完成  （点击放大 和缩小  边界    不能超过 真实图片的宽高（存储真实宽高的 这做判断））


				// 算出图片的 left，top值   使用图片居中
				this.IL = (W - this.IW) / 2;
				this.IT = (H - this.IH) / 2;

				//=>把图片绘制到CANVAS中
				this.drawImage();
			};
		}
	}

	drawImage = () => {
		let { W, H } = this.state;
		this.ctx = this._canvas.getContext('2d'); // 获取canvas 上下文
		this.ctx.clearRect(0, 0, W, H); // 清空画布
		this.ctx.drawImage(this.img, this.IL, this.IT, this.IW, this.IH);
		// 绘制画布   (this.img,X,Y,图片的W，图片的H)
	}

}
/**
 * 
 * 1. 把 vs 下面的语法 修改为 JS+React  可格式化代码

 * 2.setState 有时候同步，有时候异步  
(原生的时候是同步)




winW 页面宽
Ratio  rem转px 的一个值
w 画布 canvas
H 画布的高 canvas

maskW  
maskH 

ml  mt 居中显示






this._file 是ref 获取的DOM元素

picOM = this._file.filses[0] 获取上传的一张图息  （是一个对象）

需要使用 fileReade = new FileReader() 类来进行转换

使用 类上的一个方法  filReade.readAsDataURL(picOM) 将获取的图片转成 BASE64码

filReade.onload   将ev.target.result 将BASE64码放到一个图片中

this._canvas.getContext('2d') 获取上下文
drawImage(this.img,X,Y,图片的W，图片的H) 绘制canvas

图片的宽 和高 需要 和canvas的画布 有一定的比例 


n 缩放比例
W canvas宽  H canvas高


IL  IT 算出图片的 left，top值   使用图片居中

clearRect(0，0，W，H)移出画布图片的方法 清空画布




drawImage（） 方法  是实现图片的放大，缩小的方法封装


点击放大 和缩小  边界    不能超过 真实图片的宽高（存储真实宽高的 这做判断）



移动端的拖拽
 ontouchStart开始 
  记录 手指起始位置   startX  startY         ev.changedTouches[0]

     
 ontouchMove移动
 获取移动时当前的位置  changeX  changeY 

if(Math.abs()> 10  ... 判断偏移值  

每次移动结束 都让 startX Y 回归初始值 


裁剪：
getImageData(ML,MT,MW ,MH ) 获取mask 区域的图片

创建新的canvas  将获取到的截取图片 绘制到新的canvas中  使用.putImageData(数据，放在画布中的X，Y ， 图片的XY，图片宽高)

 toDataURL（‘指定格式 ’）将这个传给change方法


子传给父数据    事件 
 父定义一个change方法

 子组件上 chagnge={this.change}

 子组件获取方法，并传参
 this.props.change( )



  
hammer.js 

zepto.js  pinchIn  pinchOut  双指裁切


fastclick  移动端点击事件

 
 * 
 * 
 * 
 */
export default ImageClip;