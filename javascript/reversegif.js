/*global $, document, window */
var ReverseGIF;

ReverseGIF = function () {
	'use strict';

	var $headline = document.getElementById('headline'),
		$text = document.getElementById('text'),
		$tag = document.getElementById('tag'),
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
			$tag.innerHTML = '#' + gifData.tags[0];
		},

		// get and render the post from kinja
		getKinja: function (tags) {
			return $.ajax({
				type: 'GET',
				url: 'http://api.kinja.com/api/tag/' + encodeURIComponent(tags[0]),
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
			var d = document.createElement('div');
			d.innerHTML = html;
			return d.innerText;
		},

		// control the operation!
		start: function () {
			privateApi.getGif().done(function (resp) {
				privateApi.renderImage(resp.data);
				privateApi.getKinja(resp.data.tags).done(privateApi.renderHeadline);
			});
			window.clearInterval(interval);
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