/*global $, document, window, screen */
var ReverseGIF;

ReverseGIF = function () {
	'use strict';

	var $headline = document.getElementById('headline'),
		$text = document.getElementById('text'),
		$tag = document.getElementById('tag'),
		deviceWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width,
		excerptLength = (deviceWidth > 768) ? 500 : 140,
		interval, privateApi, publicApi;

	privateApi = {
		// get and render the image from giphy
		getGif: function () {
			return $.ajax({
				type: 'GET',
				url: 'http://api.giphy.com/v1/gifs/random',
				dataType: 'json',
				data: {
					api_key: 'dc6zaTOxFJmzC'
				}
			});
		},
		renderImage: function (gifData) {
			document.body.style.backgroundImage = 'url(' + gifData.image_url + ')';
			$tag.innerHTML = '#' + privateApi._getImageTag(gifData.tags);
		},

		// get and render the post from kinja
		getKinja: function (tags) {
			return $.ajax({
				type: 'GET',
				url: 'http://api.kinja.com/api/core/tag/' + encodeURIComponent(privateApi._getImageTag(tags)),
				dataType: 'jsonp',
				jsonp: 'jsonp',
				data: {
					maxReturned: 1
				}
			});
		},
		renderHeadline: function (resp) {
			if (resp.meta.status === 200) {
				var excerpt = privateApi._cleanupExcerpt(resp.data.items[0].post.excerpt);
				$headline.innerHTML = '<a href="' + resp.data.items[0].post.permalink + '">' + resp.data.items[0].post.headline + '</a>';
				$headline.className = 'show';
				if (excerpt !== '') {
					$text.innerHTML = excerpt;
					$text.className = 'show';
				}
			}
		},

		// helper method to clean up html from excerpts
		_cleanupExcerpt: function (html) {
			var d = document.createElement('div'),
				textVal;
			d.innerHTML = html;
			textVal = d.innerText;
			return (textVal.length > excerptLength) ? textVal.substring(0, 140) + '...' : textVal;
		},

		// helper method to get the tag to look for
		_getImageTag: function (taglist) {
			var retval = 'kinja';
			if (taglist.length > 0) {
				retval = taglist[0];
			}
			return retval;
		},

		// control the operation!
		start: function () {
			privateApi.getGif().done(function (resp) {
				privateApi.renderImage(resp.data);
				privateApi.getKinja(resp.data.tags).done(privateApi.renderHeadline);
			});
			if (interval) {
				window.clearInterval(interval);
			}
			interval = window.setInterval(publicApi.reload, 30000);
		},

		// empty the page
		cleanup: function () {
			$headline.innerHTML = '';
			$headline.className = '';
			$text.innerHTML = '';
			$text.className = '';
		}
	};

	publicApi = {
		start: privateApi.start,
		reload: function () {
			privateApi.cleanup();
			privateApi.start();
		}
	};

	return publicApi;
};
