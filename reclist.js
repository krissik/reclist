/* global $ */
/* global console */

var url = "http://192.168.178.88/Rec/";
//var url = "indexOfRec.html";

var createUniqueList = function() {
    'use strict';
    var that = {};
    var _formatDate = function(dateString) {
        var year = dateString.slice(0,4);
        var month = dateString.slice(4,6);
        var day = dateString.slice(6,8);
        var hour = dateString.slice(8,10);
        var minute = dateString.slice(10,12);
        return day + "." + month + "." + year + " " + hour + ":" + minute;
    };
    var append = function(title, link) {
        var list = title.split('-');
        var channelToAppend = list[0];
        var show = list[1];
        var dateAndFileext = list[2];
        if (typeof dateAndFileext === "undefined") {
            return;
        }
        if (dateAndFileext.substring(0,2) !== "20") {
            /* Fix to show titles that have a minus (-) in name */
            dateAndFileext = list[3];
        }
        var indexOfDot = dateAndFileext.indexOf(".");
        var date = _formatDate(dateAndFileext.substring(0, indexOfDot));
        var fileExt = dateAndFileext.substring(indexOfDot);
        var ignore = false;
        if(fileExt === ".epg" || fileExt === ".se") {
            ignore = true;
        }
        var epgLink = link.replace(".ts",".epg");
        if (typeof that[channelToAppend] === "undefined" && channelToAppend !== " Parent Directory") {
            that[channelToAppend] = [];
        }
        var channel = that[channelToAppend];
        if(typeof channel !== "undefined" && !ignore) {
            channel.push({show:show, date: date, link: url + link, epgLink: url + epgLink});
        }
    };
    var getChannels = function() {
        var channels = [];
        var i;
        for (i in that) {
            if (i !== "append" && i !== "getChannels") {
                channels.push(i);
            }
        }
        return channels;
    };
    that.getChannels = getChannels;
    that.append = append;
    return that;
};


var showEPG = function(link, id) {
    'use strict';
    $.get(link, function(data) {
        console.debug(data);
        $("#" + id).empty();
        $("#" + id).append(data);
        $("#" + id).show();

    });
};
$.get(url , function(data) {
    'use strict';
    var $jQueryObject = $($.parseHTML(data));
    var a = $jQueryObject.find("li a");
    var channels = createUniqueList();
    a.each(function(i) {
        var current = $(this).text();
        var link = $(this).attr("href");
        if (current === " Parent Directory") {
            return;
        }
        channels.append(current, link);
    });
    $.each(channels.getChannels(), function(i, value) {
        $("#content").append("<h1>" + value + "</h1>");

        $.each(channels[value], function(j, show) {
            var epgLink = "<a href='javascript:showEPG(\"" + show.epgLink + "\",\"epg" + i + "-" + j + "\")'><img src=\"info_icon.png\"</a>";
            $("#content").append("<h2><a href='" + show.link + "'>" + show.show + "&nbsp; <img src=\"play_icon.png\"></a>" + epgLink + "&nbsp;" + show.date + "</h2>");
            $("#content").append("<div class=\"epg\" id=epg" + i + "-" + j + "></div>");
        });
        
    });
});