import Vue from 'vue'

//时间过滤器
Vue.filter("dateFormat",(date,args) => {
    return dateFormat(date,args)
})
/**
 * 
 * @param {string} date 日期型的时间戳
 * @param {*} format 要格式化的样式
 */
function dateFormat(date,format) {
    if (typeof date === "string") {
        //match() 方法可在字符串内检索指定的值，或找到一个或多个正则表达式的匹配。
        //如果传入的字符串格式为 '\/Date(1645344455528)\/'，通过正则表达式
        var mts = date.match(/(\/Date\((\d+)\)\/)/); //根据匹配的结果，组成数组
        if (mts && mts.length >= 3) {
            date = parseInt(mts[2]);
        }
    }
    date = new Date(date);
    if (!date || date.toUTCString() == "Invalid Date") { //toUTCString() 方法把一个日期转换为一个字符串，使用UTC时区。
        return "";
    }
    var map = {
        "M": date.getMonth() + 1, //月份 
        "d": date.getDate(), //日 
        "h": date.getHours(), //小时 
        "m": date.getMinutes(), //分 
        "s": date.getSeconds(), //秒 
        "q": Math.floor((date.getMonth() + 3) / 3), //季度 
        "S": date.getMilliseconds() //毫秒 
    };

    //yyyy-MM-dd hh:mm:ss查找过程，出现y 查找到结果all=yyyy，使用y进行查找元素t=y
    format = format.replace(/([yMdhmsqS])+/g, function(all, t) { 
        var v = map[t];
        // console.log(all,t,v);   //dd d 20
        if (v !== undefined) {
            //补0 写的很精妙 比如20号，正则表达式 all = MM，此时v=20  
            if (all.length > 1) {
                v = '0' + v; // v= '020'
                v = v.substr(v.length - 2);  //'020'.substr(1), 从第二个位置截取一直截取到最后
            }
            return v; //20 将结果返回替换dd为20
        } else if (t === 'y') {
            return (date.getFullYear() + '').substr(4 - all.length);
        };
        return all;
    });
    return format;
}