function draw_daisy(petals, sex, name) {

    var debug = false;          // For debugging purposes

    var x, y;                   // Petal coords

    var w = window.innerWidth;  // Width of the current window

    var h = window.innerHeight; // Height of the current window

    var petals_nodes = [];      // Contains the references of every
                                // petal DOM node

    var radius = 70;            // Radius of the petals crown

    var phi = (2 * Math.PI) / petals;

    var labels = [' Loves You Not :(', ' Loves You :)'];

    var paper = Raphael(document.getElementById('canvas_container'), w, h);

    var start_value = Math.round(Math.random());

    var loves_me = function() {
        return (petals % 2) ? start_value : !start_value;
    }();

    debug && console.log("START: " + start_value + "| NAME: " + name+ "| LOVE: " + loves_me + "| SEX: " + sex );

    var to_deg = function(rad) {
        return Math.ceil((rad * (360 / (2 * Math.PI))));
    };

    var circle = paper.circle(w / 2, h / 2 + 1, radius).attr({
        'fill': '#EFF0B0',
        'stroke': '#95A8AE',
        'stroke-width': '4px'
    });

    var string_starting = (start_value === 1) ? sex + " Loves me." : sex + " Loves me Not.";

    var starting_with_label = paper.text(w / 2, h / 2 - radius - 200, "Starting with: " + string_starting).attr({
        'font': '26px FontinSansRegular, Arial, sans-serif',
        'fill': '#888F95'
    }).animate({
            'opacity': 0
    }, 5000, "<", function() {
        this.remove();
    });

    var petal_shape = "c-7.276,6.58969 -10.51035,16.68304 -12.06271,26.08893c-2.0025,12.13831 -1.71109,24.57149 -0.66882,36.78889c0.39667,4.65001 0.91312,9.29015 1.52673,13.91747c-0.00293,0.23557 0.02966,0.46298 0.09015,0.67992c1.12311,8.34036 2.55618,16.64291 4.1626,24.89778c2.16595,11.12805 4.69537,22.18103 7.34351,33.20383c1.20801,5.02866 2.47708,10.04739 3.57632,15.10104c0.48917,2.25433 2.88715,2.43988 4.32431,1.35345c1.20569,0.92065 3.09943,0.99686 4.09573,-0.68924c4.60349,-7.77386 8.24557,-16.17239 11.76025,-24.47495c5.28864,-12.48785 10.01892,-25.21593 14.07974,-38.15746c4.18704,-13.35039 7.73431,-26.98927 9.68854,-40.8602c1.62387,-11.52005 2.55679,-23.86018 -0.72644,-35.19179c-2.70041,-9.314 -9.07025,-16.92151 -18.80652,-19.08803c-2.63297,-0.58743 -5.34851,-0.89162 -8.05478,-0.89162c-7.40103,0 -14.76199,2.27818 -20.32861,7.32196";

    for (var i = 0; i < petals; i++) {
        (function(i, x, y) {
            x = Math.cos(phi * i) * radius;
            y = Math.sin(phi * i) * radius;
            debug && console.log("φ: " + to_deg(phi * i) + "| x" + i + ", y" + i + ": " + x + " | " + y);

            petals_nodes[i] = paper.path("m " + ((w / 2) + x) + "," + ((h / 2) + y) + "" + petal_shape).attr({
                'stroke': '#888F95',
                'fill': '#FFF',
                'stroke-width': '4'
            }).translate(-8, -150).rotate(to_deg(phi * i) + 90, false).translate(x - 10, y + 80).toFront();

            debug && paper.circle(w / 2 + x, h / 2 + y, 1).attr({
                'fill': '#000000',
                'stroke-width': '10'
            });

            // Setting Nodes
            petals_nodes[i].mouseover(function() {
                this.node.style.cursor = "pointer";
            });

            petals_nodes[i].click(function() {
                // Petal animation
                this.animate({
                    'translation': x * 3 + ", " + y * 3,
                    'rotation': to_deg(phi * i) + 450
                }, 1000, '>', function() {
                    // Fade out the petal
                    this.animate({
                            'opacity': 0}, 200, function() {
                        if (this.node) {
                            // Updates the counter:
                            counter -= 1;
                            counter_label.attr({
                                    'text': "Petals left:\n" + counter
                            });

                            this.remove();

                            if (counter === 0) {
                                debug && console.log("No more petals left!");

                                var div = (loves_me) ? '#share' : '#again';

                                paper.text(w / 2, h, name + "" + labels[(loves_me) ? 1 : 0]).attr({
                                        'font': '72px FontinSansRegular, Arial, sans-serif',
                                        'fill': '#777777'
                                }).animate({
                                        'translation': 0 + ", " + (-h / 2 - radius - 80)
                                }, 2000, 'elastic', function() {
                                    $(div).fadeIn(500).each(function() {
                                        var message = 'I\'ve just discovered that ' + name + ' Loves me on http://daisy.no.de';
                                        $(this).find('p').click(function() {
                                                if (div === '#share') {
                                                    if ($(this).hasClass('twitter_share')) {

                                                            $.ajax({
                                                                type: "POST",
                                                                url: "/twitter_share",
                                                                data: {
                                                                    'message': message,
                                                                    'petals': petals,
                                                                    'radius': radius
                                                                },
                                                                success: function(request_token_url) {
                                                                    window.location.replace(request_token_url);
                                                                }
                                                            });
                                                    }
                                                    else if ($(this).hasClass('facebook_share')) {
                                                        var stringify = function(jsonItem) {
                                                            var uri = ["http://www.facebook.com/dialog/feed?app_id=181984455187210"];

                                                            for (var k in jsonItem) {
                                                                uri.push(k + "=" + encodeURIComponent(jsonItem[k]));
                                                            }

                                                            return uri.join('&');
                                                        }

                                                        var params = {
                                                            'app_id': 181984455187210,
                                                            'redirect_uri': "http://127.0.0.1:8080",
                                                            'message': message,
                                                            'caption': "What's this?",
                                                            'link': "http://127.0.0.1:8080",
                                                            'description': "A small, quick romantic game. Share your love on Facebook!",
                                                            'picture': "http://fbrell.com/f8.jpg",
                                                            'name': "Loves me, Loves me Not"
                                                        };

                                                        window.location.replace(stringify(params));
                                                    }
                                              }
                                              else {
                                                    window.location.reload();
                                              }
                                          });
                                    });
                                });
                            }
                        }
                    });
                }).toFront();
            });
        })(i, x, y);
    }

    // Counter
    var counter = petals_nodes.length;
    var counter_label = paper.text(w / 2, h / 2 + 3, "Petals left:\n" + counter).attr({
            'font': '20px FontinSansBold, Arial, sans-serif',
            'fill': '#888F95'
    }).attr({
            'opacity': 0
    });

    debug && paper.path("M " + w / 2 + ",0 L " + w / 2 + ", " + h + " M 0," + h / 2 + " L " + w + ", " + h / 2).attr({
        'stroke-dasharray': ['--']
    });

    // Counter Tooltip

    (function() {
            var st = paper.set();
            st.push(circle, counter_label);

        st.hover(function() {
            counter_label.animate({
                'opacity': 1
            }, 200);
        }, function() {
            counter_label.animate({
                'opacity': 0
            }, 200);
        });

        circle.toFront();
        counter_label.toFront();
        starting_with_label.toFront();
    })();
}

$(document).ready(function() {

    var sex;
    var name;

    // Hide raphael canvas
    $('#canvas_container').hide();

    // Fade in page
    $('#central_block').hide().fadeIn(800);

    // She or He?
    $('#title span').each(function() {
        $(this).click(function() {
            var input_name = $('#input-name');
            if ($(this).hasClass('she')) {
                sex = "She";
                input_name.find('input').attr({
                        'placeholder': "Type her name"
                });
            } else if ($(this).hasClass('he')) {
                sex = "He";
                input_name.find('input').attr({
                        'placeholder': "Type his name"
                });
            }

            // Display the form
            input_name.fadeIn(200);
        });
    });

    // Prevent default action
    $('#input-name').submit(function() {
        // Save the name for later usage
        name = $(this).find('input').val();
        // Capitalize name
        name = name[0].toUpperCase() + name.slice(1);
        $('#central_block').fadeOut(500, function() {
            // Draw the daisy
            draw_daisy(Math.round(1 + (23 * Math.random())), sex, name);
            //draw_daisy(3, sex, name);
            $('#canvas_container').fadeIn(500);
        });
        return false;
    });

    //draw_daisy(3);
});
