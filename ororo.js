/*
 *  ororo.tv  - Movian Plugin
 *
 *  Copyright (C) 2014-2015 Buksa, lprot
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
//ver 0.7.4
var http = require('showtime/http');
var html = require('showtime/html');

var plugin_info = plugin.getDescriptor();
var PREFIX = plugin_info.id;
var USER_AGENT = //'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.90 Safari/537.36 OPR/29.0.1795.47';
'Mozilla/5.0 (iPad; U; CPU OS 3_2 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Version/4.0.4 Mobile/7B334b Safari/531.21.10'
var BASE_URL = 'http://ororo.tv';
var logo = plugin.path + plugin_info.icon;
var loggedIn = false;
var tos = 'The developer has no affiliation with the sites what so ever.\n';
tos += 'Nor does he receive money or any other kind of benefits for them.\n\n';
tos += 'The software is intended solely for educational and testing purposes,\n';
tos += 'and while it may allow the user to create copies of legitimately acquired\n';
tos += 'and/or owned content, it is required that such user actions must comply\n';
tos += 'with local, federal and country legislation.\n\n';
tos += 'Furthermore, the author of this software, its partners and associates\n';
tos += 'shall assume NO responsibility, legal or otherwise implied, for any misuse\n';
tos += 'of, or for any loss that may occur while using plugin.\n\n';
tos += 'You are solely responsible for complying with the applicable laws in your\n';
tos += 'country and you must cease using this software should your actions during\n';
tos += 'plugin operation lead to or may lead to infringement or violation of the\n';
tos += 'rights of the respective content copyright holders.\n\n';
tos += "plugin is not licensed, approved or endorsed by any online resource\n ";
tos += "proprietary. Do you accept this terms?";
// Register a service (will appear on home page)
var service = plugin.createService("Ororo.tv", PREFIX + ":start", "video", true, logo);
//settings
var settings = plugin.createSettings("Ororo.tv", logo, plugin_info.synopsis);
//var main_menu_order = plugin.createStore('main_menu_order', true);
var items = [];
var items_tmp = [];
settings.createInfo("info", logo, "Plugin developed by " + plugin_info.author + ". \n");
settings.createDivider('Settings:');
settings.createBool("tosaccepted", "Accepted TOS (available in opening the plugin)", false, function(v) {
    service.tosaccepted = v;
});
settings.createString('geoURL', "geo URL", 'http://ororo.tv', function(v) {
    service.geoURL = v;
});
settings.createBool("arrayview", "Show array view", false, function(v) {
    service.arrayview = v;
});
settings.createBool("thetvdb", "Show more information using thetvdb", false, function(v) {
    service.thetvdb = v;
});
settings.createBool("subs", "Show Subtitle from Ororo.tv ", true, function(v) {
    service.subs = v;
});
settings.createBool("search", "Search", false, function(v) {
    service.search = v;
});
settings.createBool("debug", "Debug logging", false, function(v) {
    service.debug = v;
});
var Format = [
    ['.mp4', 'MP4', true],
    ['.webm', 'Webm/VP8']
];
settings.createMultiOpt("Format", "Format", Format, function(v) {
    service.Format = v;
});
plugin.addItemHook({
    title: "Search in Another Apps",
    itemtype: "video",
    handler: function(obj, nav) {
        var title = obj.metadata.title.toString();
        title = title.replace(/<.+?>/g, "").replace(/\[.+?\]/g, "");
        nav.openURL("search:" + title);
    }
});
//set header and cookies for ororo.tv
plugin.addHTTPAuth("http:\/\/.*ororo.tv.*", function(authreq) {
    authreq.setHeader("User-Agent", "Mozilla/5.0 (Windows NT 6.2; WOW64; rv:25.0) Gecko/20100101 Firefox/25.0");
    authreq.setCookie("video", "true");
});
plugin.addURI(PREFIX + ":login:(.*):(.*)", function(page, query, token) {
    popup.notify('Start login procedure from Ororo.tv', 5);
    p('loggedIn: ' + loggedIn)

    if (loggedIn) page.redirect(PREFIX + ':start')

    var reason = "Login required";
    var do_query = false;


    while (1) {

        var credentials = plugin.getAuthCredentials("Ororo.tv",
            reason, do_query);
        p(credentials)
        if (!credentials) {
            if (query && !do_query) {
                do_query = true;
                continue;
            }

        }

        if (credentials.rejected) page.error("Rejected by user")
            // return "Rejected by user";
        try {
            v = http.request(service.geoURL + '/users/sign_in', {
                // noFollow: true,
                postdata: {
                    utf8: '✓',
                    authenticity_token: token,
                    'user[email]': credentials.username,
                    'user[password]': credentials.password,
                    'user[remember_me]': 1
                },
                headers: {
                    'Host': 'ororo.tv',
                    'Connection': 'keep-alive',
                    //Content-Length: 257
                    'Pragma': 'no-cache',
                    'Cache-Control': 'no-cache',
                    'Origin': 'http://ororo.tv',
                    'X-CSRF-Token': token,
                    'User-Agent': USER_AGENT,
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'Accept': '*/*',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Referer': service.geoURL + '/users/sign_in',
                    'Accept-Encoding': 'gzip, deflate',
                    'Accept-Language': 'en-US,en;q=0.8,zh;q=0.6,zh-CN;q=0.4,zh-TW;q=0.2'
                    //Cookie: id=86fdb91c7fc0182eef6d72093840ac62; locale=en
                }
            })
        } catch (err) {

            p(err)
            reason = 'Error'
            do_query = true;
            continue;
        }
        if (v) {
            p('Logged in to Ororo.tv as user: ' + credentials.username);
            p(loggedIn)
            loggedIn = true
            p(loggedIn)
            break
        }
    }

    page.redirect(PREFIX + ':start');
});
plugin.addURI(PREFIX + ":logout", function(page) {
    var request = http.request(service.geoURL + '/users/sign_out', {
        //  noFollow: true,
        headers: {
            'Referer': service.geoURL + '/users/sign_out',
            'User-Agent': USER_AGENT
        }
    });
    loggedIn = false
    popup.notify('Successfully logout from Ororo.tv', 2);
    page.loading = false;
    //page.redirect(PREFIX + ":start");
});
//First level start page
plugin.addURI(PREFIX + ":start", function(page) {
    page.loading = true;
    var i, v, remember_user_token, authenticity_token;
    if (!service.tosaccepted)
        if (popup.message(tos, true, true)) service.tosaccepted = 1;
        else {
            page.error("TOS not accepted. plugin disabled");
            return;
        }
    if (service.arrayview) page.metadata.glwview = plugin.path + "views/array2.view";
    pageMenu(page);
    page.metadata.logo = logo;
    page.metadata.title = PREFIX;
    page.appendItem(PREFIX + ":browse:" + '/', 'directory', {
        title: 'tv shows'
    });
    page.appendItem(PREFIX + ":browse:" + '/movies#free', 'directory', {
        title: 'movies'
    });
    v = http.request(service.geoURL, {
        method: 'GET',
        headers: {
            'User-Agent': USER_AGENT
        }
    }).toString();
    var dom = html.parse(v);
    p(MetaTag(dom, "csrf-token"));
    //check for LOGIN state
    var reLogin = /"email":"([^"]+)"/g;
    var loginState = reLogin.exec(v);
    if (!loginState) {
        p('Login procedure started!~');
        if (MetaTag(dom, "csrf-token")) token = MetaTag(dom, "csrf-token");
        p("will redirect to (PREFIX + ':login:true:token')");
        page.redirect(PREFIX + ':login:true:' + token);
        return;
    } else {
        print('Logged in as:' + loginState[1]);
        //get current cookies
        //service.userCookie = doc.headers['Set-Cookie'];
        page.appendItem(PREFIX + ":logout", "directory", {
            title: new showtime.RichText("Log out form account " + loginState[1])
        });
    }
    page.metadata.title = dom.root.getElementByTagName('title')[0].textContent;
    page.loading = false;
    page.type = "directory";
    page.contents = "items";
});

plugin.addURI(PREFIX + ":browse:(.*)", function(page, link) {
    page.loading = true;
    page.type = "directory";
    page.contents = "items";
    if (service.arrayview) page.metadata.glwview = plugin.path + "views/array2.view";
    pageMenu(page);
    items = [];
    items_tmp = [];
    p(link)
    link == '/' ? link = service.geoURL : link = service.geoURL + link
    p(link)
    var dom = html.parse(http.request(link, {
        method: 'GET',
        headers: {
            'User-Agent': USER_AGENT
        }
    }));

    var infoshow = []
    dom.root.getElementByClassName('index show').forEach(function(element, i) {
        page.metadata.title = new showtime.RichText('Ororo.tv | ' + (link == service.geoURL ? "TV Shows" : "Movies") + ' [' + i + ']');
        var show = {}
        show.newest = element.attributes.getNamedItem('data-newest').value;
        show.title = element.getElementByClassName('name')[0].textContent.trim();
        show.href = element.getElementByClassName('name')[0].attributes.getNamedItem('href').value;
        show.icon = element.getElementByTagName('img')[0].attributes.length == 4 ? element.getElementByTagName('img')[0].attributes.getNamedItem('src').value : element.getElementByTagName('img')[0].attributes.getNamedItem('data-original').value;
        show.desc = element.getElementByClassName('desc')[0].getElementByTagName('p')[0].textContent;
        show.year = element.getElementByClassName('cam')[0].getElementByClassName('value')[0].textContent;
        show.rating = parseInt((element.getElementByClassName('star')[0].getElementByClassName('value')[0].textContent ? element.getElementByClassName('star')[0].getElementByClassName('value')[0].textContent : '0'), 10);
        show.lastupdated = element.attributes.getNamedItem('data-lastupdated').value;
        show.genre = element.attributes.getNamedItem('data-info').value;
        show.free = element.getElementByClassName('show_block free').length;
        if (show.free) {
            show.lastupdated = Date.now();
            show.title = '<font color="#52f7b9">' + show.title + '</font>';
        }
        infoshow.push(show);
    })
    var its = sort(infoshow, {
        lastupdated: 0
    });

    its.forEach(function(i) {
        var item = page.appendItem(PREFIX + ":page:" + i.href, "video", {
            title: new showtime.RichText(i.title.trim()),
            icon: BASE_URL + i.icon,
            description: i.desc + '\n' + i.lastupdated,
            rating: i.rating * 10,
            genre: i.genre,
            year: parseInt(i.year, 10)
        });
        item.title = i.title
        item.lastupdated = i.lastupdated;
        item.newest = i.newest
        item.rating = i.rating;
        item.free = i.free.length;
        items.push(item);
        //    //items_tmp.push(item);
    })

    try {
        items.forEach(function(items, i) {
            items.id = i
        })
        items_tmp = page.getItems();

    } catch (ex) {
        t("Error while parsing main menu order");
        e(ex);
    }
    page.loading = false;
});
plugin.addURI(PREFIX + ":page:(.*)", function(page, link) {
    page.type = "directory";
    page.contents = "items";
    var res = http.request(BASE_URL + link, {
        method: 'GET',
        headers: {
            'User-Agent': USER_AGENT
        }
    });
    var dom = html.parse(res);
    var poster_info = dom.root.getElementById('poster_info');
    var ptitle = poster_info.getElementById('poster').attributes.getNamedItem('alt').value;
    var icon = poster_info.getElementById('poster').attributes.getNamedItem('src').value;
    var year = parseInt(poster_info.getElementById('year').textContent.trim(), 10);
    p(poster_info.getElementById('rating').textContent ? poster_info.getElementById('rating').textContent.trim() : 0)
    var rating = +(poster_info.getElementById('rating').textContent ? poster_info.getElementById('rating').textContent.trim() : 0) * 10;
    var duration = parseInt(poster_info.getElementById('length').textContent.trim(), 10);
    var genre = poster_info.getElementById('genres').textContent.trim();
    page.metadata.logo = BASE_URL + icon;
    page.metadata.title = ptitle + " (" + year + ")";
    if (service.arrayview) {
        page.metadata.background = bg(ptitle);
        page.metadata.backgroundAlpha = 0.5;
    }
    var ptype = dom.root.getElementByClassName('translation-setup');
    if (ptype[0].attributes.getNamedItem('id').value == 'movie') {
        var episode = dom.root.getElementByClassName('episode')[0];
        p(dom.root.getElementById('description').getElementByTagName('p')[0].textContent);
        var href = episode.attributes.getNamedItem('data-href').value;
        var plot = dom.root.getElementById('description').getElementByTagName('p')[0].textContent;
        item = page.appendItem(PREFIX + ":play:" + href, "video", {
            title: new showtime.RichText(ptitle),
            description: new showtime.RichText(plot),
            icon: BASE_URL + icon,
            rating: rating,
            duration: duration,
            genre: genre,
            year: year
        });
        //code
    }
    try {
        var seasons = dom.root.getElementByClassName('tab-content episodes-tab')[0];
        if (seasons) {
            for (s = 1, i = 0; i < seasons.children.length; i++, s++) {
                var season = seasons.children[i];
                page.appendItem("", "separator", {
                    title: new showtime.RichText('Season ' + s)
                });
                var episodes = season.getElementByTagName('li');
                e = 1;
                for (j in episodes) {
                    var episode = episodes[j]
                    if (episode.children.length) {
                        var href = episode.getElementByTagName('a')[0].attributes.getNamedItem('data-href').value;
                        var title = episode.getElementByTagName('a')[0].textContent;
                        var id = episode.getElementByTagName('a')[0].attributes.getNamedItem('data-id').value;
                        var plot = episode.getElementByClassName('plot')[0] ? episode.getElementByClassName('plot')[0].textContent : ''
                        item = page.appendItem(PREFIX + ":play:" + href, "video", {
                            title: new showtime.RichText(title),
                            description: new showtime.RichText(plot),
                            icon: BASE_URL + icon,
                            rating: rating,
                            duration: duration,
                            genre: genre,
                            year: year
                        });
                        if (service.thetvdb) {
                            item.bindVideoMetadata({
                                title: trim(ptitle),
                                season: +s,
                                episode: +e
                            });
                        }
                        p(title);
                    }
                    e++;
                }
            }
        }
    } catch (ex) {
        page.error("Failed to process page");
        e(ex);
    }
    page.loading = false;
});
// Play links
plugin.addURI(PREFIX + ":play:(.*)", function(page, url) {
    page.loading = true;
    page.metadata.logo = logo;
    var res = http.request(BASE_URL + url, {
        method: 'GET',
        debug: service.debug,
        headers: {
            'User-Agent': USER_AGENT
        }
    });
    var videoparams = {
        no_fs_scan: true,
        title: '',
        season: 0,
        episode: 0,
        canonicalUrl: PREFIX + ":play:" + url,
        sources: [{
                url: []
            }
        ],
        subtitles: []
    };
    videoparams = get_video_link(res, videoparams);
    page.source = "videoparams:" + JSON.stringify(videoparams);
    page.loading = false;
    page.type = "video";
});


plugin.addSearcher(PREFIX + " TV Shows", logo, function(page, query) {
    if (service.search){
    p(service.search)
    page.entries = 0;
    getShows({
        query: query
    }, function(error, results) {

        results.forEach(function(i) {
            var item = page.appendItem(PREFIX + ":page:" + i.href, "video", {
                title: new showtime.RichText(i.title.trim()),
                icon: BASE_URL + i.icon,
                description: i.desc + '\n' + i.lastupdated,
                rating: i.rating * 10,
                genre: i.genre,
                year: parseInt(i.year, 10)
            });
page.entries++
        })


    })

    }
});


function get_video_link(res, videoparams) {
    var dom = html.parse(res);
    var video = dom.root.getElementByTagName('video');
    res = res.toString();
    p(video[0].attributes);
    try {
        videoparams.title = video[0].attributes.getNamedItem('data-show').value;
        if (video[0].attributes.getNamedItem('data-season')) {
            videoparams.season = video[0].attributes.getNamedItem('data-season') ? +video[0].attributes.getNamedItem('data-season').value : 0;
            videoparams.episode = video[0].attributes.getNamedItem('data-number') ? +video[0].attributes.getNamedItem('data-number').value : 0;
        }
        var video_url = match(/<source src='\/(.*?)' type='video/, res, 1) ? BASE_URL + match(/<source src='\/(.*?)' type='video/, res, 1) : match(/<source src='(.*?)' type='video/, res,
            1);
        videoparams.sources = [{
                url: video_url.replace('.webm', service.Format)
            }
        ];
        if (service.subs === true) {
            var re = /subtitles'.*?label='([^']+)+.*?src='([^']+)/g;
            var subtitles = re.exec(res);
            while (subtitles) {
                p("Found subtitles:" + subtitles[1] + subtitles[2]);
                videoparams.subtitles.push({
                    url: BASE_URL + subtitles[2],
                    language: subtitles[1],
                    title: subtitles[2].match(/file\/\d+\/([^']+)/)[1]
                });
                subtitles = re.exec(res);
            }
        }
    } catch (err) {
        e(err);
    }
    return videoparams;
}

function pageMenu(page) {
    if (service.arrayview) {
        page.metadata.background = plugin.path + "views/img/background.png";
        page.metadata.backgroundAlpha = 0.5;
    }

    page.appendAction("pageevent", "sortViewsDec", true, {
        title: "Sort by Views (Decrementing)",
        icon: plugin.path + "views/img/sort_views_dec.png"
    });
    page.appendAction("pageevent", "sortAlphabeticallyInc", true, {
        title: "Sort Alphabetically (Incrementing)",
        icon: plugin.path + "views/img/sort_alpha_inc.png"
    });
    page.appendAction("pageevent", "sortAlphabeticallyDec", true, {
        title: "Sort Alphabetically (Decrementing)",
        icon: plugin.path + "views/img/sort_alpha_dec.png"
    });
    //data-category="popularity"> Popularity
    //data-category="lastupdated">Last updated
    //data-category="newest">Last added
    //data-category="imdb">By rating
    //data-category="alphabetical">By name
    //data-category="latest">By year
    var sorts = [
        ["sortDefault", "Default/Last updated", true],
        ["sortAlphabeticallyInc", "By name (A->Z)"],
        ["sortViewsDec", "Views (decrementing)"],
        ["sortDateDec", "Published (decrementing)"],
        ["sortAlphabeticallyDec", "By name (Z->A)"]
    ];
    page.options.createMultiOpt("sort", "Sort by...", sorts, function(v) {
        eval(v + "()");
    });

    function sortAlphabeticallyInc() {
        var its = sort(items, {
            title: 1
        });
        pageUpdateItemsPositions(its);
    }

    function sortAlphabeticallyDec() {
        var its = sort(items, {
            title: 1
        });
        pageUpdateItemsPositions(its);
    }

    function sortViewsDec() {
        var its = sort(items, {
            rating: 0
        });
        pageUpdateItemsPositions(its);
    }

    function sortDateDec() {
        var its = sort(items, {
            newest: 0
        });
        pageUpdateItemsPositions(its);
    }

    function sortDefault() {
        var its = sort(items, {
            lastupdated: 0
        });
        pageUpdateItemsPositions(its);
    }

    page.onEvent('sortAlphabeticallyInc', function() {
        sortAlphabeticallyInc();
    });
    page.onEvent('sortAlphabeticallyDec', function() {
        sortAlphabeticallyDec();
    });
    page.onEvent('sortViewsDec', function() {
        sortViewsDec();
    });
    page.onEvent('sortDateDec', function() {
        sortDateDec();
    });
    page.onEvent('sortDefault', function() {
        sortDefault();
    });
}

function pageUpdateItemsPositions(its) {
    for (var i in its) {
        items[its[i].orig_index].moveBefore(i);
    }
}

function sort(items, field) {
    if (items.length === 0) return null;
    var its = [];
    for (var i in items) {
        items[i].orig_index = i;
        its.push(items[i]);
    }
    its.sort(SortBy(field));
    return its;
}
//
//extra functions
//
//*** This code is copyright 2004 by Gavin Kistner, !@phrogz.net
//*** It is covered under the license viewable at http://phrogz.net/JS/_ReuseLicense.txt
//*** Reuse or modification is free provided you abide by the terms of that license.
//*** (Including the first two lines above in your source code mostly satisfies the conditions.)
// Returns a function which can be used to sort an Array by multiple criteria.
// Can be called in one of three ways:
//   var sortFunc = SortBy( 'name' , 'age' , 'sex' );
//   var sortFunc = SortBy( ['name','age','sex'] );
//   var sortFunc = SortBy( { name:1, age:1, sex:1 } );
//
// The first two methods are equivalent, and sort in ascending order.
// The last method allows you to specify sort direction:
//   1 (or true)  specifies ascending sort order.
//   0 (or false) specifies descending sort order.
//
// The sort function is constructed using 'dot notation' for the properties;
// this means you can also specify a method to call on the object by putting
// parentheses at the end of the name.
// e.g. var stupidDateStringSort = SortBy('toDateString()','toTimeString()');

function SortBy() {
    var a = arguments,
        len = a.length,
        f = 'return ',
        p = 1,
        i;
    if (len == 1 && (a[0].constructor == Object || a[0].constructor == Array) && ((o = a = a[0]).constructor == Object)) p = 0;
    if (p && (o = {}))
        for (i = 0, len = a.length; i < len; i++) o[a[i]] = 1;
    for (k in o) {
        var z = o[k] ? ['<', '>'] : ['>', '<'];
        f += 'a.' + k + z[0] + 'b.' + k + '?-1:a.' + k + z[1] + 'b.' + k + '?1:';
    }
    return new Function('a', 'b', f + '0');
}
// Add to RegExp prototype
RegExp.prototype.execAll = function(str) {
    var match = null;
    for (var matches = []; null !== (match = this.exec(str));) {
        var matchArray = [],
            i;
        for (i in match) {
            parseInt(i, 10) == i && matchArray.push(match[i]);
        }
        matches.push(matchArray);
    }
    if (this.exec(str) === null) return 0
    return matches;
};

function MetaTag(dom, tag) {
    var meta = dom.root.getElementByTagName('meta')
    for (i in meta) {
        if (meta[i].attributes.getNamedItem('property') && meta[i].attributes.getNamedItem('property').value == tag) return meta[i].attributes.getNamedItem('content').value;
        if (meta[i].attributes.getNamedItem('name') && meta[i].attributes.getNamedItem('name').value == tag) return meta[i].attributes.getNamedItem('content').value;
    }
    return 0;
}

function bg(title) {
    var v = http.request('http://www.thetvdb.com/api/GetSeries.php', {
        'seriesname': title,
        'language': 'ru'
    }).toString();
    var id = match(/<seriesid>(.+?)<\/seriesid>/, v, 1);
    if (id) {
        v = (http.request('http://www.thetvdb.com/api/0ADF8BA762FED295/series/' + id + '/banners.xml').toString());
        id = match(/<BannerPath>fanart\/original\/([^<]+)/, v, 1);
        return "http://thetvdb.com/banners/fanart/original/" + id;
    }
    return plugin.path + "views/img/background.png";
}

function getCookie(name, multiheaders) {
    var cookie = JSON.stringify(multiheaders['Set-Cookie']);
    p('cookie: ' + cookie);
    var matches = cookie.match(new RegExp('(?:^|; |","|")' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));
    return matches ? name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=' + decodeURIComponent(matches[1]) : false;
}

function match(re, st, i) {
    i = typeof i !== 'undefined' ? i : 0;
    if (re.exec(st)) {
        return re.exec(st)[i];
    } else return '';
}

function trim(s) {
    s = s.toString();
    s = s.replace(/(\r\n|\n|\r)/gm, "");
    s = s.replace(/(^\s*)|(\s*$)/gi, "");
    s = s.replace(/[ ]{2,}/gi, " ");
    return s;
}

function e(ex) {
    t(ex);
    t("Line #" + ex.lineNumber);
}

function t(message) {
    if (service.debug) showtime.trace(message, plugin.getDescriptor().id);
}

getShows = function(options, callback) {
    start = Date.now()
p(start)
    http.request(service.geoURL, {
        method: 'GET',
        headers: {
            'User-Agent': USER_AGENT
        }
    }, function(error, response) {
        if (!error && response.headers.Status === '200 OK') {
            p(response.headers.Status === '200 OK')

            var list = [];
            var dom = html.parse(response.toString())
            dom.root.getElementByClassName('index show').forEach(function(element) {
                var show = {}
                show.title = element.getElementByClassName('name')[0].textContent
                show.href = element.getElementByClassName('name')[0].attributes.getNamedItem('href').value;
                show.icon = element.getElementByTagName('img')[0].attributes.length == 4 ? element.getElementByTagName('img')[0].attributes.getNamedItem('src').value : element.getElementByTagName('img')[0].attributes.getNamedItem('data-original').value;
                show.desc = element.getElementByClassName('desc')[0].getElementByTagName('p')[0].textContent;
                show.year = element.getElementByClassName('cam')[0].getElementByClassName('value')[0].textContent;
                show.rating = element.getElementByClassName('star')[0].getElementByClassName('value')[0].textContent ? element.getElementByClassName('star')[0].getElementByClassName('value')[0].textContent : '0';
                show.lastupdated = element.attributes.getNamedItem('data-lastupdated').value;
                show.genre = element.attributes.getNamedItem('data-info').value;
                show.free = element.getElementByClassName('show_block free').length;
                if (options && options.query) {
                    if (show.title.toLowerCase().search(options.query.toLowerCase()) >= 0) {
                        //console.log(show.title);
                        list.push(show);
                    }

                    //if (show.title.toLowerCase().indexOf(options.query.toLowerCase()) >= 0) {
                    //    //console.log(show.title);
                    //    list.push(show);
                    //}

                } else {
                    list.push(show)
                }
            })
p(Date.now()-start)
            if (callback) callback(null, list);
        } else {
            console.log("Error getting shows", error, response);
            if (callback) callback(new Error("Error getting shows"), null);
        }

    });


};

function p(message) {
    if (service.debug == '1') {
        print(message);
        if (typeof(message) === 'object') print(dump(message));
    }
}

function dump(arr, level) {
    var dumped_text = "";
    if (!level) level = 0;
    //The padding given at the beginning of the line.
    var level_padding = "";
    for (var j = 0; j < level + 1; j++) level_padding += "    ";
    if (typeof(arr) == 'object') { //Array/Hashes/Objects
        for (var item in arr) {
            var value = arr[item];
            if (typeof(value) == 'object') { //If it is an array,
                dumped_text += level_padding + "'" + item + "' ...\n";
                dumped_text += dump(value, level + 1);
            } else {
                dumped_text += level_padding + "'" + item + "' => \"" + value + "\"\n";
            }
        }
    } else { //Stings/Chars/Numbers etc.
        dumped_text = arr;
    }
    return dumped_text;
}