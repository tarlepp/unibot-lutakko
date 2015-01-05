/**
 * Plugin dependencies.
 *
 * @type {exports}
 */
var helpers = require('unibot-helpers');
var cheerio = require('cheerio');

/**
 * Lutakko plugin for UniBot.
 *
 * This plugin fetches event information from http://www.jelmu.net/ website.
 *
 * Also note that this plugin relies heavily to HTML structure of that site. So there will be times, when this plugin
 * doesn't work right.
 *
 * @todo    Make item count configurable
 * @todo    Make bot just to say one message (need more opinions of this)
 *
 * @param   {Object} options Plugin options object, description below.
 *   db: {mongoose} the mongodb connection
 *   bot: {irc} the irc bot
 *   web: {connect} a connect + connect-rest webserver
 *   config: {object} UniBot configuration
 *
 * @return  {Function}  Init function to access shared resources
 */
module.exports = function init(options) {
    // Actual plugin implementation.
    return function plugin(channel) {
        // Regex rules for plugin
        return {
            '^!lutakko$': function lutakko(from, matches) {
                helpers.download('http://www.jelmu.net/', function success(data) {
                    if (data == null) {
                        channel.say(from, 'Did not get any data from URL http://www.jelmu.net/ - site maybe down?');
                    } else {
                        var $ = cheerio.load(data);

                        $("ul[role='upcoming-events'] li").each(function iterator(i, elem) {
                            if (i < 3) {
                                var event = $(this);
                                var date = event.find('div.date span').text().trim();
                                var artists = [];

                                event.find('a span').each(function iterator() {
                                    artists.push($(this).text().trim());
                                });

                                if (artists.length > 0) {
                                    channel.say(date + ' ' + artists.join(' '));
                                } else {
                                    channel.say(from, 'Did not find any "proper" artist data...');
                                }
                            }
                        });
                    }
                });
            }
        };
    };
};