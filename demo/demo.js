
require.config({
    paths: {
        "simelt": "../src/simelt",
        "jquery": "jquery-1.12.4"
    }
})

define(function (require) {

    var $ = require('jquery');
    var simelt = require('simelt');

    simelt.config({ selector: '.simelt' }).init(); 

    var data = getData();

    simelt.load(data);

    simelt.openFirst();

    simelt.change(function (id1, id2, name1, name2) {
        $('.display').html('选择了' + name2);
    });

    $("#jump").click(function () {
        simelt.jump('12');
    })

    $("#look").click(function () {
        var t = $("textarea");
        t.html('');
        t.append(' id1：' + simelt.id1);
        t.append('\n')
        t.append(' id2：' + simelt.id2);
        t.append('\n')
        t.append(' name1：' + simelt.name1);
        t.append('\n')
        t.append(' name2：' + simelt.name2);
    })
})

function getData() {
    var data = [{
        menuId: '1',
        menuName: '一级菜单A',
        iconUrl: '../src/img/folder-collect.png',
        children: [{
            menuId: '11',
            menuName: '二级菜单a'
        }, {
            menuId: '12',
            menuName: '二级菜单b'
        }]
    }, {
        menuId: '2',
        menuName: '一级菜单B',
        iconUrl: '../src/img/folder-system.png',
        children: [{
            menuId: '21',
            menuName: '二级菜单c'
        }]
    }];

    return data;
}

 
