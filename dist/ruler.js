/**Params
 * @param {Selector} container 标尺容器
 * @param {Selector} showWrap 刻度值容器
 * @param {Integer} unit 步长(一个刻度实际代表多少)
 * @param {Integer} min 最小值
 * @param {Integer} max 最大值
 * @param {Integer} prefill 预填值
 * @param {Integer} lineWidth 刻度线宽
 * @param {Integer} stepWidth 刻度间隔距离
 * @param {Integer} height canvas高度,默认50
 * @param {Integer} minNode 小刻度长度
 * @param {Integer} midNode 中刻度长度
 * @param {Integer} midNode 大刻度长度
 * @param {String} basicColor 基本色
 * @param {String} checkedColor 选中色
 * @param {String} textColor 文本选中色
 * @param {Function} moveCallback 滑动回调
 * @param {Function} endCallback 抬手回调
 */

/** new Ruler()
 * @param {Element} this.container
 * @param {Element} this.showWrap
 * @param {Element} this.canvas
 * @param {Object} this.ctx
 * @param {Integer} this.width 容器宽
 * @param {Integer} this.range 总刻度数
 * @param {Integer} this.translateX canvas translateX值 <= 0
 * @param {Integer} this.value 选中数值
 * @param {Integer} this.score 选中刻度数
 * @param {Function} this.init 初始化程序
 * @param {Function} this.calcWidth 计算容器宽
 * @param {Function} this.conversion 值转换
 * @param {Function} this.assignment 初始化程序
 * @param {Function} this.draw 画
 * @param {Function} this.addEvent 事件
 * @param {Function} getStyle
 */

(function (global, factory) {
    if (typeof define === 'function' && (define.amd || define.cmd)) {
        define(factory);
    } else {
        global.Ruler = factory();
    }
}(this, function () {
    'use strict';
    var Ruler = function(params) {
        this.container = null;
        this.canvas = null;
        this.ctx = null;
        this.value = 0;
        this.score = 0;
        this.translateX = 0;
        var _params = {
            container: null,
            showWrap: null,
            unit: 1,
            min: 0,
            max: 100,
            prefill: 0,
            lineWidth: 1, 
            stepWidth: 6,//刻度步长
            height: 50, //canvas默认高度
            minNode: 8,
            midNode: 15,
            maxNode: 20,
            basicColor: '#E4E4E4',
            checkedColor: '#f00',
            textColor: '#f00',
            moveCallback: function() {
                //arguments: this
            },
            endCallback: function() {
                //arguments: this
            }
        };
        //对象合并
        Object.assign(_params, params);
        //初始化
        this.init = function() {
            this.container = document.querySelector(_params.container);
            this.showWrap = document.querySelector(_params.showWrap);
            this.width = this.calcWidth();
            this.container.style.width = this.width + 'px';
            this.container.style.WebkitTransform = 'translateZ(0)';
            this.container.style.overflow = 'hidden';
            //最大刻度
            this.range = (_params.max - _params.min) / _params.unit;

            var canvas = document.createElement('canvas');
            canvas.width = this.range * _params.stepWidth + this.width;
            canvas.height = _params.height;
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            //位移、刻度初始化
            this.conversion(_params.prefill, false);
            this.translateX = -this.score * _params.stepWidth;
            this.canvas.style.WebkitTransform = 'matrix(1, 0, 0, 1, '+ this.translateX +', 0)';
            this.assignment();
            //画
            this.draw(this.score);
            //绑定事件
            this.addEvent();
            //插入DOM
            this.container.appendChild(canvas);
        };

        //判断线宽计算容器宽
        this.calcWidth = function() {
            var width = _params.width ? _params.width : Ruler.getStyle(this.container, 'width');
            return _params.lineWidth % 2 ? parseInt(width / 2) * 2 : parseInt(width / 2) * 2 + 1;
        }

        /**
         * @param {number} val 位移
         * @param {boolean} flag true:位移=>实际距离=>刻度，false:实际距离=>位移=>刻度
         */
        this.conversion = function(val, flag) {
            if(flag) {
                this.score = Math.floor(Math.abs(val) / _params.stepWidth);
                this.value = this.score * _params.unit + _params.min;
            } else {
                this.value = Math.floor(val / _params.unit) * _params.unit;
                this.score = (this.value - _params.min) / (_params.unit);
            }
        };

        this.assignment = function() {
            this.showWrap.innerText = this.value;
        }

        this.draw = function(scale) {
            var i,num1 = 0,num2 = 0;
            //清除画布
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            //默认刻度
            for(i = 0; i <= this.range; i++) {
                this.ctx.save();
                this.ctx.lineWidth = _params.lineWidth;
                this.ctx.strokeStyle = _params.basicColor;

                this.ctx.translate(this.width / 2 + _params.stepWidth * i, _params.height);
                
                this.ctx.beginPath();
                this.ctx.moveTo(0, 0);
                if(i%5 === 0) {
                    if(i%2 === 0) {
                        this.ctx.lineTo(0, -_params.maxNode);
                    } else {
                        this.ctx.lineTo(0, -_params.midNode);
                    }
                } else {
                    this.ctx.lineTo(0, -_params.minNode);
                }
                this.ctx.closePath();
                this.ctx.stroke();
                this.ctx.restore();
            }
            //默认数字
            for(i = 0; i <= this.range; i++) {
                this.ctx.save();
                this.ctx.font = "10px Arial";
                this.ctx.fillStyle = _params.basicColor;
                if(i%10 === 0) {
                    let text = _params.min + num1 * _params.unit * 10;
                    this.ctx.translate(-(this.ctx.measureText(text).width) / 2, 0);
                    this.ctx.fillText(text, this.width / 2 + num1 * _params.stepWidth * 10, _params.maxNode + 2);
                    num1++;
                }
                this.ctx.restore();
            }
            //实时刻度
            for(i = 0; i <= scale; i++) {
                this.ctx.save();
                this.ctx.lineWidth = _params.lineWidth;
                this.ctx.strokeStyle = _params.checkedColor;

                this.ctx.translate(this.width / 2 + _params.stepWidth * i, _params.height);
                
                this.ctx.beginPath();
                this.ctx.moveTo(0, 0);
                if(i%5 === 0) {
                    if(i%2 === 0) {
                        this.ctx.lineTo(0, -_params.maxNode);
                    } else {
                        this.ctx.lineTo(0, -_params.midNode);
                    }
                } else {
                    this.ctx.lineTo(0, -_params.minNode);
                }
                this.ctx.closePath();
                this.ctx.stroke();
                this.ctx.restore();
            }
            //实时数字
            for(i = 0; i <= scale; i++) {
                this.ctx.save();
                this.ctx.font = "10px Arial";
                this.ctx.fillStyle = _params.textColor;
                
                if(i%10 === 0) {
                    let text = _params.min + num2 * _params.unit * 10;
                    this.ctx.translate(-(this.ctx.measureText(text).width) / 2, 0);
                    this.ctx.fillText(text, this.width / 2 + num2 * _params.stepWidth * 10, _params.maxNode + 2);
                    num2++;
                }
                this.ctx.restore();
            }
        };

        this.addEvent = function() {
            var _that = this,
                sx,//手指按下时x坐标
                matrix,//当前的transform矩阵
                nowX;//translateX的值

            _that.container.addEventListener('touchstart', function tStart(se) {
                se.preventDefault();
                sx = se.touches[0].pageX;
                matrix = _that.canvas.style.WebkitTransform;
                nowX = parseInt(matrix.substring(7).split(',')[4]);

                document.addEventListener('touchmove', tMove);
                document.addEventListener('touchend', tEnd);
            });
            function tMove(me) {
                var mx = me.touches[0].pageX,
                    diffX = mx - sx,
                    newX = _that.translateX = nowX + diffX;
                
                if(_that.translateX <= 0 && _that.translateX >= -(_that.canvas.width - _that.width + 1)) {
                    _that.conversion(_that.translateX, true);
                    _that.draw(_that.score);
                }
                else if(_that.translateX >= 0) {
                    _that.conversion(0, true);
                    _that.draw(0);
                } else {
                    _that.conversion(_that.range, true);
                    _that.draw(_that.range);
                }
                _that.assignment();
                _that.canvas.style.WebkitTransform = 'matrix(1, 0, 0, 1, '+newX+', 0)';
                _params.moveCallback(_that);
            }
            function tEnd(ee) {
                _that.canvas.style.transition = 'transform 0.2s';
                if(_that.translateX >= 0) {
                    _that.translateX = 0;
                } else if(_that.translateX < -(_that.canvas.width - _that.width)) {
                    _that.translateX = -(_that.canvas.width - _that.width);
                } else {
                    _that.translateX = -Math.floor(-_that.translateX / _params.stepWidth) * _params.stepWidth;
                }
                _that.conversion(_that.translateX, true);

                _that.assignment();

                _that.draw(_that.score);

                _that.canvas.style.WebkitTransform = 'matrix(1, 0, 0, 1, '+ _that.translateX +', 0)';

                _params.endCallback(_that);

                setTimeout(function(){
                    _that.canvas.style.transition = '';
                }, 100);

                document.removeEventListener('touchmove', tMove);
                document.removeEventListener('touchend', tEnd);
            }
        };
        this.init();
    }
    Ruler.getStyle = function(element,attr) {
        if(element.currentStyle){   //针对ie获取非行间样式
            return parseInt(element.currentStyle[attr]);
        }else{
            return parseInt(getComputedStyle(element,false)[attr]);   //针对非ie
        };
    }
    return Ruler;
}));