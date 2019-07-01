class WaterMark {
  constructor(option) {
    this.hasMark = false;
    this.option = {
      ...option,
      id: 'waterMark',
      fontSize: 14,
      fontFamily: 'Arial',
      color: '#959494',
      rotate: 30,
      userName: this.getUserName(),
    };
    this.handleCreateListener();
    this.hackPrint();
  }

  /**
   * 获取用户名信息
   */
  getUserName() {
    const cookie = document.cookie;
    const arr = cookie.split(';');
    let ret = undefined;
    arr.forEach(item => {
      const index = item.replace(' ', '').indexOf('user_name');
      if (index !== -1) {
        ret = item.replace(' ', '').replace('user_name=', '');
      }
    });
    return ret || 'noCookie';
  }

  /**
   * 检查当前水印DOM节点是否存在
   */
  handleCheckDom() {
    const {
      id,
    } = this.option;
    const ele = document.querySelector(id);
    return ele;
  }

  /**
   * 生成带用户名的 Canvas
   */
  handleCreateCanvas() {
    const {
      color,
      fontSize,
      fontFamily,
      rotate,
      userName
    } = this.option;
    const ele = document.createElement('canvas');
    const canvas = ele.getContext('2d');
    const width = 100;
    const height = 100;
    const alpha = 0.65;
    ele.width = width;
    ele.height = height;
    canvas.font = `${fontSize}px ${fontFamily}`;
    canvas.fillStyle = color;
    canvas.globalAlpha = alpha;
    canvas.translate(-Math.floor(width / 2), Math.floor(height / 2));
    canvas.rotate((-rotate / 180) * Math.PI);
    canvas.fillText(userName, Math.floor(width / 2), Math.floor(height / 2));
    return ele;
  }

  /**
   * 转换成 base64 格式的图片
   */
  handleCreateBgUrl() {
    return this.handleCreateCanvas().toDataURL();
  }

  /**
   * Dom书中添加水印节点
   */
  handleCreateDom() {
    const flag = this.handleCheckDom();
    if (!flag) {
      const url = this.handleCreateBgUrl();
      const waterMarkDom = document.createElement('div');
      const styleOption = `
        position: fixed;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        z-index: 999;
        pointerEvents: none;
        background-repeat: repeat;
        background-image: url('${url}');
      `;
      this.waterMarkStyle = styleOption;
      waterMarkDom.style = styleOption;
      waterMarkDom.id = this.option.id;
      document.body.appendChild(waterMarkDom);
    }
  }

  /**
   * 监听Dom树的变化
   */
  handleObserverDom() {
    const mutation = window.MutationObserver || window.WebkitMutationObserver || window.MozMutationObserver;
    const config = {
      attributes: true,
      childList: true,
      subtree: true,
    };
    if (mutation) {
      let listener = new MutationObserver(() => {
        const ele = document.querySelector(this.option.id);
        if (!ele || (ele && ele.style !== this.waterMarkStyle)) {
          listener.disconnect();
          listener = null;
          this.handleCreateDom();
        }
      });
      listener.observe(document.body, config);
    }
  }

  /**
   * 添加 listener 待插入水印节点
   */
  handleCreateListener() {
    document.addEventListener('DOMContentLoaded', () => {
      this.handleCreateDom();
    });
    window.addEventListener('hashChange', () => {
      this.handleCreateDom();
    });
  }

  /**
   * 针对浏览器预览打印时会遮住打印文档的问题做hack
   */
  hackPrint() {
    const ele = document.createElement('style');
    ele.type = 'text/css';
    ele.innerHTML = '@media print{ #waterMark : { display: none }}';
    document.head.appendChild(ele);
  }
}

export default WaterMark;