
// simelt = side menu level two   侧边二级菜单

; (function (root, factory) {
    if (typeof define == 'function' && define.amd) {
        define(function (require) {
            var jquery = require('jquery');
            return factory(jquery);
        })
    } else {
        root.simelt = factory(root.$)
    }
}(this, function ($) {

    if (typeof $ !== 'function')
        throw new Error('模块$获取失败');

    var manager = (function ($) {
        return {
            privates: [],
            instances: [],
            ctor: null,
            create: function () {
                if (typeof ctor !== 'function')
                    throw new Error('ctor不是函数');

                var obj = new ctor();
                this.privates.push({});
                this.instances.push(obj);
                return obj;

            },
            getp: function (obj, key) {
                if (!obj || typeof key !== 'string')
                    throw new Error('getp函数参数不正确');

                for (var i = 0; i < this.instances.length; i++) {
                    if (this.instances[i] === obj) {
                        return this.privates[i][key];
                    }
                }

            },
            setp: function (obj, key, value) {

                if (!obj || typeof key !== 'string')
                    throw new Error('getp函数参数不正确');

                for (var i = 0; i < this.instances.length; i++) {
                    if (this.instances[i] === obj) {
                        this.privates[i][key] = value;
                    }
                }
            },
            fac: function (ctor) {
                var that = this;
                this.ctor = ctor;
                var dfObj = this.create();
                function ret() {
                    return that.create();
                };
                $.extend(ret, dfObj);
                this.instances[0] = ret;
                return ret;
            }
        };
    })($);

    // 记录当前执行中的动画的数目
    var currentSlidingNum = 0;

    // Level1()是一个构造函数，生成一级菜单对象
    function Level1() {

        this.element; // 一级菜单的dd元素，也是最外层元素
        this.elementTitle;   // 一级菜单中，主体部分，包含左边的图标，中间的文字，右边的箭头
        this.elementIconSpan;  // 左边的图标的span元素
        this.elementIconImg;  // 左边的图标的img元素
        this.elementArrow;   // 右边的cite元素，用于绘制小箭头
        this.ul;      // ul元素，用于存放二级菜单

        this.menuId;    // 菜单Id
        this.menuName;  // 菜单名字
        this.isOpened = false;   // 是否为打开状态
        this.children = [];   // 存放二级菜单数组        
    }

    // 读取数据 参数1是数据，参数2是作为容器的dl元素
    Level1.prototype.load = function (data, container) {

        var dd = $("<dd></dd>"); // dd元素
        var title = $("<div class='simelt-title'></div>");   //  主体部分，包含左边的图标，中间的文字，右边的箭头
        var iconSpan = $("<span></span>");   // 左侧图标部分
        var iconImg = $("<img/>"); // 左侧图标的图片部分
        var arrow = $("<cite></cite>");   // 右侧的小箭头
        var ul = $("<ul class='menuson'></ul>");    // ul元素，用于存放二级菜单
        var line = $("<div class='line'>");     // 横线特效

        /* 下面几行代码把各个元素添加到dom中 */
        container.append(dd);
        dd.append(title);
        dd.append(ul);
        dd.append(line);
        title.append(iconSpan);
        title.append(data.menuName);
        title.append(arrow);
        iconSpan.append(iconImg);

        // 将menuId保存在dom元素的属性里，方便后续处理
        title.attr('menuId', data.menuId);

        // 设置菜单的图标
        iconImg.attr('src', data.iconUrl);

        /* 下面几行代码把元素对象保存到Level1对象中 */
        this.element = dd;
        this.elementTitle = title;
        this.elementIconSpan = iconSpan;
        this.elementIconImg = iconImg;
        this.elementArrow = arrow;
        this.ul = ul;

        /* 记录菜单Id和菜单名到Level1对象中 */
        this.menuId = data.menuId;
        this.menuName = data.menuName;

        // 遍历data.children数组
        for (var i = 0; i < data.children.length; i++) {

            // 添加二级菜单
            this.addChild(data.children[i].menuId, data.children[i].menuName);
        }
    }

    // 添加二级菜单，传入参数是二级菜单的id和name
    Level1.prototype.addChild = function (menuId, menuName) {

        // 创建Level2对象
        var level2 = new Level2();

        // 将二级菜单id和name传入，同时传入一级菜单的ul，作为二级菜单的存放容器
        level2.load(menuId, menuName, this.ul);

        // 将二级菜单的parent指向该一级菜单
        level2.parent = this;

        // 将Level2对象添加到一级菜单的children属性里
        this.children.push(level2);
    }

    // 展开一级菜单   传入第一个参数描述是否是平滑的展开，第二个参数是展开完成后的回调函数
    Level1.prototype.open = function (isSmoothly, callback) {

        // 使用that作为this的引用
        var that = this;

        // 如果当前已经展开了，直接返回，不做处理
        if (this.isOpened == true) return;

        // 如果是平滑的
        if (isSmoothly === true) {

            // 增加“当前执行中的动画的数目”
            currentSlidingNum++;

            // 执行下滑动画效果
            this.ul.slideDown('normal', function () {

                // 减少“当前执行中的动画的数目”
                currentSlidingNum--;

                // 调用doOpen，执行展开效果
                doOpen();
            });
        } else { // 如果不需要平滑展开，也就是说，立即展开

            // 直接执行doOpen，执行展开效果
            doOpen();
        }

        // doOpen函数执行展开的效果
        function doOpen() {

            // 在一级菜单的dd元素上添加class，标识为展开的
            that.element.addClass('opened');

            // 将ul的设置为显示的
            that.ul.css('display', 'block');

            // 一级菜单的isOpened属性设置为true
            that.isOpened = true;

            // 执行回调函数
            if (typeof callback === 'function') { callback(); }
        }
    }

    // 合拢一级菜单   传入第一个参数描述是否是平滑的合拢，第二个参数是合拢完成后的回调函数
    Level1.prototype.close = function (isSmoothly, callback) {

        // 使用that作为this的引用
        var that = this;

        // 如果当前已经合拢了，直接返回，不做处理
        if (this.isOpened == false) return;

        // 如果是平滑的
        if (isSmoothly === true) {

            // 增加“当前执行中的动画的数目”
            currentSlidingNum++;

            // 执行上滑动画效果
            this.ul.slideUp('normal', function () {

                // 减少“当前执行中的动画的数目”
                currentSlidingNum--;

                // 调用doClose，执行合拢效果
                doClose();
            });
        } else {  // 如果不需要平滑合拢，也就是说，立即合拢

            // 直接执行doClose，执行合拢效果
            doClose();
        }

        // doClose函数执行合拢的效果
        function doClose() {

            // 在一级菜单的dd元素上删除opened类
            that.element.removeClass('opened');

            // 将ul的设置为隐藏的
            that.ul.css('display', 'none');

            // 一级菜单的isOpened属性设置为false
            that.isOpened = false;

            // 执行回调函数
            if (typeof callback === 'function') { callback(); }
        }
    }

    // Level2()是构造函数，生成二级菜单对象
    function Level2() {
        this.element; // 二级菜单的li元素，也是最外层元素
        this.elementA;  // a标签

        this.parent;  // 指向父级
        this.menuId;  // 二级菜单Id
        this.menuName;  // 菜单名字
        this.isActive = false;  // 是否激活
    }

    // 读取数据   参数分别是二级菜单的id、name，以及用于存放二级菜单的容器ul
    Level2.prototype.load = function (menuId, menuName, ul) {

        // 创建一个li，作为二级菜单的主体元素
        var li = $("<li></li>");

        // 将menuId保存在元素的属性中，方便使用
        li.attr('MenuId', menuId);

        // 创建
        var a = $("<a href='javascript:void(0)'></a>");
        a.append(menuName);
        li.append(a);
        ul.append(li);

        this.menuId = menuId;
        this.menuName = menuName;
        this.element = li;
        this.elementA = a;
    }

    // 设为活跃
    Level2.prototype.open = function () {

        if (this.isActive == true) return;

        this.element.addClass('active');
        this.isActive = true;
    }

    // 设为不活跃
    Level2.prototype.close = function () {

        if (this.isActive == false) return;

        this.element.removeClass('active');
        this.isActive = false;
    }


    var defOptions = {
        selector: '.simelt'  // 最外层dl的选择器
    };

    function ctor() {

        this.options = defOptions;
        this.element;   // 最外层的元素

        this.level1arr = [];

        this.openningLevel1;  // 正在打开的level1对象的引用
        this.openningLevel2;  // 正在打开的level2对象的引用

        this.level2OpenHandler;  // 打开level2的事件

        this.id1;     // 正打开的level1的id
        this.id2;     // 正打开的level2的id
        this.name1;   // 正打开的level1的name
        this.name2;   // 正打开的level2的name
    }

    ctor.prototype.config = function (_options) {
        this.options = $.extend(true, {}, this.options, _options);
        return this;
    }

    ctor.prototype.init = function () {

        var that = this;
        this.element = $(this.options.selector);

        // 绑定一级菜单的点击事件
        $(this.element).on('click', '.simelt-title', function (e) {

            if (currentSlidingNum > 0) return;

            var el = $(this);   // 被点击的title元素
            var menuId = el.attr('menuId');
            var level1 = findLevel1ByMenuId(menuId);

            if (!level1) return;

            if (level1.isOpened) {    // 如果点击的一级菜单本来是展开的      

                level1.close(true);   //  关闭该一级菜单

                that.openningLevel1 = null;  // “正在打开的一级菜单”指向为null

            } else {                   // 否则，点击的一级菜单本来是关闭的

                if (that.openningLevel1) {   // 如果存在“正在打开的一级菜单”

                    that.openningLevel1.close(true);    // 把“正在打开的一级菜单”关闭                 
                }

                // 打开被点击的一级菜单
                level1.open(true, function () {

                    if (that.openningLevel2 && that.openningLevel2.parent !== level1) {

                        var firstChild = level1.children[0];   // 找到刚刚打开的一级菜单的第一个孩子

                        firstChild.open();           // 打开这个孩子

                        that.openningLevel2 = firstChild;     // “正在打开的二级菜单”指向这个孩子

                        that.id1 = level1.menuId;
                        that.id2 = firstChild.menuId;
                        that.name1 = level1.menuName;
                        that.name2 = firstChild.menuName;

                        // 触发二级菜单打开事件
                        if (typeof that.level2OpenHandler === 'function') {
                            that.level2OpenHandler(level1.menuId, firstChild.menuId, level1.menuName, firstChild.menuName);
                        }
                    }
                });

                that.openningLevel1 = level1;  // “正在打开的一级菜单”指向被点击的一级菜单

                if (that.openningLevel2 && that.openningLevel2.parent !== level1) {   // 如果“正在打开的二级菜单”的父亲并不是刚刚点击的一级菜单

                    that.openningLevel2.close();     //   把“正在打开的二级菜单”关闭 

                }
            }
        })

        // 绑定二级菜单的点击事件
        $(this.element).on('click', 'li', function (e) {

            if (currentSlidingNum > 0) return;

            var el = $(this);   // 被点击的title元素
            var menuId = el.attr('menuId');
            var level2 = findLevel2ByMenuId(menuId);

            if (!level2) return;
            if (level2.isOpened) return;
            if (that.openningLevel2) that.openningLevel2.close();
            level2.open();
            that.openningLevel2 = level2;

            that.id1 = level2.parent.menuId;
            that.id2 = level2.menuId;
            that.name1 = level2.parent.menuName;
            that.name2 = level2.menuName;

            // 触发二级菜单打开事件
            if (typeof that.level2OpenHandler === 'function') {
                that.level2OpenHandler(level2.parent.menuId, level2.menuId, level2.parent.menuName, level2.menuName);
            }
        });

        function findLevel1ByMenuId(menuId) {
            for (var i = 0; i < that.level1arr.length; i++) {
                if (that.level1arr[i].menuId == menuId)
                    return that.level1arr[i];
            }
        }

        function findLevel2ByMenuId(menuId) {
            if (!that.openningLevel1) return;
            var children = that.openningLevel1.children;
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                if (child.menuId == menuId) return child;
            }
        }

        return this;
    }

    // 加载数据
    ctor.prototype.load = function (data) {

        var that = this;

        // 添加一个横线
        var line = $("<div class='line'>");
        this.element.append(line);

        // 添加一个dl元素，作为存放一级菜单的容器
        var dl = $("<dl></dl>");
        this.element.append(dl);

        var list = data;   // 一级菜单数组
        var container = dl;  // dl元素作为存放一级菜单的容器

        for (var i = 0; i < list.length; i++) {
            var item = list[i];

            var level1 = new Level1();
            level1.load(item, container);
            this.level1arr.push(level1);
        }
    }

    // 跳转到指定的二级菜单
    ctor.prototype.jump = function (menuIdLevel2) {

        for (var i = 0; i < this.level1arr.length; i++) {
            var level1 = this.level1arr[i];
            for (var j = 0; j < level1.children.length; j++) {
                var level2 = level1.children[j];

                if (level2.menuId == menuIdLevel2) {

                    if (this.openningLevel1 && this.openningLevel1 !== level1) {
                        this.openningLevel1.close();
                    }

                    level1.open();
                    this.openningLevel1 = level1;

                    if (this.openningLevel2 && this.openningLevel2 !== level2) {
                        this.openningLevel2.close();
                    }

                    level2.open();
                    this.openningLevel2 = level2;

                    this.id1 = level1.menuId;
                    this.id2 = level2.menuId;
                    this.name1 = level1.menuName;
                    this.name2 = level2.menuName;

                    // 触发二级菜单打开事件
                    if (typeof this.level2OpenHandler === 'function') {
                        this.level2OpenHandler(level1.menuId, level2.menuId, level1.menuName, level2.menuName);
                    }

                    return;
                }
            }
        }
    }

    // 打开第一个二级菜单
    ctor.prototype.openFirst = function () {

        // 默认选择最前面的二级菜单
        var firstLevel1 = this.level1arr[0];
        if (firstLevel1 && firstLevel1.children.length > 0) {

            var firstLevel2 = firstLevel1.children[0];

            firstLevel1.open();
            this.openningLevel1 = firstLevel1;

            firstLevel2.open();
            this.openningLevel2 = firstLevel2;

            this.id1 = firstLevel1.menuId;
            this.id2 = firstLevel2.menuId;
            this.name1 = firstLevel1.menuName;
            this.name2 = firstLevel2.menuName;

            // 触发二级菜单打开事件
            if (typeof this.level2OpenHandler === 'function') {
                this.level2OpenHandler(firstLevel1.menuId, firstLevel2.menuId, firstLevel1.menuName, firstLevel2.menuName);
            }
        }
    }

    // 绑定change事件
    ctor.prototype.change = function (func) {
        this.level2OpenHandler = func;
    }

    return manager.fac(ctor);
}))