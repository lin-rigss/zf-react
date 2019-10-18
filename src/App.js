import React from 'react';
import ImageClip from './component/ImageClip';
import './static/reset.min.css';
import './app.css';

class App extends React.Component {
  constructor(props) {
    super(props);

    //=>初始化状态
    this.state = {
      stage: 1,  // 控制 个人信息  及选择头像 两个部分的状态  
      pic: ''
    };
  }

  render() {
    let { stage, pic } = this.state;

    return <main className="mainBox">

      {/* 个人信息 */}
      <div className="baseInfo"
        style={{
          display: stage === 0 ? 'block' : 'none'
        }}>
        <div className="imgBox"
          onClick={ev => {
            this.setState({ stage: 1 });
          }}>
          <img src={pic} alt="" />
        </div>
        <div className="desc">
          <p>姓名：周啸天</p>
          <p>性别：男</p>
          <p>微信：18310612838</p>
          <p>......</p>
        </div>
      </div>


      {/* 选择头像 */}
      <div className="handleBox" style={{
        display: stage === 0 ? 'none' : 'block'
      }}>
        <div className="returnBtn">
          <span onClick={ev => {
            this.setState({ stage: 0 });
          }}>返回</span>
        </div>
        <ImageClip change={this.change}></ImageClip>
      </div>
    </main>;
  }

  // 子组件向父组件传值   使用回调函数方式    事件 
  change = imagedata => {
    this.setState({
      stage: 0,
      pic: imagedata
    });
  }
}

export default App;
