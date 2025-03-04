import * as poly from "./poly.js";
import * as mtx from "./matrix.js";
import * as bt from "./thoughts.js";

/*
DOM elements
*/

const btnNew = document.getElementById("btnNew");
const btnShape = document.getElementById("btnShape");
const lblShape = document.getElementById("lblShape");
const btnTheme = document.getElementById("btnTheme");
const btnThemeText = document.getElementById("btnThemeText");
const playerA = document.getElementById("playerA");
const playerB = document.getElementById("playerB");
const lblScoreA = document.getElementById("lblScoreA");
const lblScoreB = document.getElementById("lblScoreB");
const divGrid = document.getElementById("gridId");
const lblSize = document.getElementById("sizeId");
const header_row = document.getElementById("headerRow");
const undoButton = document.getElementById("btnUndo");
const redoButton = document.getElementById("btnRedo");
const playerAName = document.getElementById("playerAName");
const playerBName = document.getElementById("playerBName");
const lblPlayerAName = document.getElementById("lblPlayerAName");
const lblPlayerBName = document.getElementById("lblPlayerBName");
const collinearChoices = document.getElementById("collinearChoice");
const radioAToPlay = document.getElementById("AToPlay");
const radioBToPlay = document.getElementById("BToPlay");
const divPlayers = document.getElementById("divPlayers");
const lblWinner = document.getElementById("lblWinner");
const lblWinnersName = document.getElementById("lblWinnersName");
const winnerModal = document.getElementById("winnerModal");
const btnAcceptResult = document.getElementById("btnAcceptResult");
const lblCellsPlayed = document.getElementById("lblCellsPlayed");
const btnResetScores = document.getElementById("btnResetScores");
const undoModal = document.getElementById("undoModal");
const inpUndo = document.getElementById("inpUndo");
const btnAcceptUndo = document.getElementById("btnAcceptUndo");
const welcomeModal = document.getElementById("welcomeModal");
const btnGotIt = document.getElementById("btnGotIt");
const chkSeparateColours = document.getElementById("chkSeparateColours");
const lblVariation = document.getElementById("lblVariation");
const variationChoice = document.getElementById("variationChoice");
const variationBasic = document.getElementById("variationBasic");
const variationTerritorial1 = document.getElementById("variationTerritorial1");
const variationTerritorial2 = document.getElementById("variationTerritorial2");
const opponent0 = document.getElementById("opponent0");
const opponent1 = document.getElementById("opponent1");
const opponent2 = document.getElementById("opponent2");
const opponent3 = document.getElementById("opponent3");
const opponentChoices = document.getElementById("opponentChoice");
const thinkingModal = document.getElementById("thinkingModal");
const lblThinkingSpinner = document.getElementById("lblThinkingSpinner");
const lblThought = document.getElementById("lblThought");
const lblBowserIcon = document.getElementById("lblBowserIcon");
const chkChatty = document.getElementById("chkChatty");
const btnEnough = document.getElementById("btnEnough");

function set_cell_fill() {
    cell_fill_a = cell_fill_1;
    cell_fill_b = cell_fill_1;
    cell_fill_start = cell_fill_1;
    if (chkSeparateColours.checked) {
        cell_fill_b = cell_fill_2;
        cell_fill_start = "dimgray";
    }
}

function get_session() {

    var s;

    engine_depth = default_engine_depth;

    // Playing order
    s = sessionStorage.getItem("nim_player_order");
    if (s != null) player_order = s;

    // Player Names
    var pa = sessionStorage.getItem("nim_A");
    if (pa == null) pa = "";
    lblPlayerAName.textContent = pa;
    playerAName.value = pa;

    var pb = sessionStorage.getItem("nim_B");
    if (pb == null) pb = "";
    lblPlayerBName.textContent = pb;
    playerBName.value = pb;

    // Separate Colours
    s = sessionStorage.getItem("nim_separate_colours");
    if (s == "true") {
        chkSeparateColours.checked = true;
    } else {
        chkSeparateColours.checked = false;
    }

    // Chatty Bowser
    s = sessionStorage.getItem("nim_chatty");
    if (s != null) {
        if (s == "true") {
            chkChatty.checked = true;
        } else {
            chkChatty.checked = false;
        }
    }

    // Variation
    if (variation == null) {
        variation = "Basic";
        s = sessionStorage.getItem("nim_variation");
        if (s != null) {
            document.getElementById(`variation${s}`).checked = true;
            variation = s;
        }
    }
    lblVariation.textContent = variationLabels[variation]

    // Opponent
    if (opponent == null) {
        opponent = 0;
        s = sessionStorage.getItem("nim_opponent");
        if (s != null) {
            document.getElementById(`opponent${s}`).checked = true;
            opponent = parseInt(s);
        }
        if (opponent > 0) {
            set_opponent(opponent);
            lblPlayerBName.textContent = opponentLabels[opponent];
            lblBowserIcon.classList.add("d-inline-block")
            lblBowserIcon.classList.remove("d-none")
        }
        else {
            lblBowserIcon.classList.remove("d-inline-block")
            lblBowserIcon.classList.add("d-none")
        }
    }

    // Shape
    if (shape == null) {
        shape = "hexagon";
        s = sessionStorage.getItem("nim_shape");
        if (s != null) shape = s;
    }
    lblShape.textContent = shape;
    lblThinkingSpinner.textContent = shape;

    // Collinearity
    if (collinearity == null) {
        collinearity = 3;
        s = sessionStorage.getItem("nim_collinearity");
        if (s != null) {
            document.getElementById(`co${s}`).checked = true;
            collinearity = parseInt(s);
        }
    }
    if (collinearity > 4) engine_depth = 2;

    // Game scores
    if (score_games == null) {
        score_games = { "A": 0, "B": 0 };
        s = sessionStorage.getItem("nim_score_games");
        if (s != null) {
            score_games = JSON.parse(s);
        }
    }

    // Point scores from stakes variation
    if (score_points == null) {
        score_points = { "A": 0, "B": 0 };
        s = sessionStorage.getItem("nim_score_points");
        if (s != null) {
            score_points = JSON.parse(s);
        }
    }

    // Show new game options if not in progress
    if (player_order != null) {
        const bsGrid = new bootstrap.Collapse("#gridId");
        bsGrid.show();
    } else {
        const bsNew = new bootstrap.Collapse("#new-game");
        bsNew.show();
    }

}

function set_opponent(opp) {

    if (opp > 0) {
        const name = opponentLabels[opp];
        // lblPlayerBName.textContent = name
        playerBName.value = name;
        playerBName.disabled = true;
        // lblBowserIcon.classList.add("d-inline")
        // lblBowserIcon.classList.remove("d-none")
    } else {
        var pb = sessionStorage.getItem("nim_B");
        if (pb == null) pb = "";
        // lblPlayerBName.textContent = pb;
        playerBName.value = pb;
        playerBName.disabled = false;
        // lblBowserIcon.classList.remove("d-inline")
        // lblBowserIcon.classList.add("d-none")
    }
}

function set_shape_class() {
    if (shape == "square") {
        shape_class = new poly.Square();
    } else {
        shape_class = new poly.Hexagon();
    }
}

function get_instructions() {
    // Get the instructions and point of undo from session storage
    var s;
    if (instructions == null) {
        instructions = [["+", shape_class.origin]];
        var ps = sessionStorage.getItem("nim_instructions");
        if (ps != null) {
            instructions = JSON.parse(ps);
        }
    }

    undo_index = instructions.length;
    s = sessionStorage.getItem("nim_undo_index");
    if (s != null) {
        undo_index = parseInt(s);
    }
    if (undo_index > instructions.length) {
        undo_index = instructions.length;
    }
}

function get_my_points_territorial() {
    // create the points set
    // my_points = new Set([JSON.stringify(shape_class.origin)]);
    // this includes the origin on the first go
    // this function to be dropped, get_border will receive my_points
    // as an optional set
    var my_points = new Set();
    if (undo_index <= 2 || variation == "Territorial1") {
        my_points.add(JSON.stringify(shape_class.origin));
    }
    for (var i = 1; i < undo_index; i++) {
        var ins = instructions[i];
        if ((undo_index - i) % 2 == 0) {
            my_points.add(JSON.stringify(ins[1]));
        }
    }
    return my_points;
}

function get_mine_and_theirs() {
    var my_points = new Set();
    var their_points = new Set();
    if (undo_index <= 2 || variation != "Territorial2") {
        my_points.add(JSON.stringify(shape_class.origin));
        their_points.add(JSON.stringify(shape_class.origin));
    }
    for (var i = 1; i < undo_index; i++) {
        var ins = instructions[i];
        if ((undo_index - i) % 2 == 0) {
            my_points.add(JSON.stringify(ins[1]));
        } else {
            their_points.add(JSON.stringify(ins[1]));
        }
    }
    return [my_points, their_points];
}

function set_points() {
    // create the points set
    set_of_points = new Set();
    for (var i = 0; i < undo_index; i++) {
        var ins = instructions[i];
        set_of_points.add(JSON.stringify(ins[1]));
    }
}

function add_cell(d) {
    // Add a cell to the poly
    instructions.length = undo_index;
    instructions.push(["+", JSON.parse(d)]);
    set_of_points.add(d);
    undo_index += 1;
    sessionStorage.setItem("nim_instructions", JSON.stringify(instructions));
    sessionStorage.setItem("nim_undo_index", undo_index);
}

function get_border(points, my_points) {
    // generate the border
    // points: whole polyomino
    // my_points: optional for territorial include the origin
    // we will handle excluding the origin for Territorial2
    if (variation == "Basic") {
        return shape_class.border(points);
    } else {
        // determine my_points from instructions if not given
        // when engine thinking my_points should be given 
        // this is just assist normal play
        if (my_points == null) {
            my_points = get_my_points_territorial();
        }
        if (undo_index <= 2 || variation == "Territorial1") {
            // if its first go for either player or we are playing v1
            // then cells bordering the origin are not excluded
            return shape_class.border(my_points, points);
        } else {
            // otherwise exclude cells bordering the origin
            const o = new Set([JSON.stringify(shape_class.origin)]);
            const ob = shape_class.border(o);
            const exclude = new Set([...points, ...ob]);
            return shape_class.border(my_points, exclude);
        }
    }
}

function get_border_validity(bd, wrt) {
    // return invalid cells of the given border with
    // respect to a set of played cells
    var valid = new Set();
    var invalid = new Set();
    for (const d of bd) {
        var cp = find_collinear(d, wrt);
        if (cp == null) {
            valid.add(d)
        } else {
            invalid.add(d);
        }
    }
    return [valid, invalid];
}

function update_grid() {

    var invalid_cells;
    var valid_cells;

    // generate the border
    border = get_border(set_of_points);

    // and which are valid or not
    [valid_cells, invalid_cells] = get_border_validity(border);

    // we have a winner
    if (valid_cells.size == 0) {
        var winner = player_order[(undo_index) % 2];
        if (opponent == 0) {
            lblWinner.textContent = "Player " + winner;
        } else {
            if (winner == "A") {
                lblWinner.textContent = "You"
            } else {
                lblWinner.textContent = "The browser"
            }

        }
        if (winner == "A") {
            lblWinnersName.textContent = lblPlayerAName.textContent;
        } else {
            if (opponent == 0) {
                lblWinnersName.textContent = lblPlayerBName.textContent;
            }
            else {
                lblWinnersName.textContent = "";
            }
        }
        lblCellsPlayed.textContent = undo_index;
        var modal = new bootstrap.Modal(winnerModal);
        modal.show();
    } else {
        if (hint) {
            outcomes = {};
            outcomes = assess_options();
        }
    }


    var update;
    update = g_border.selectAll("polygon.border").data(Array.from(border), (d) => { return d; });
    update.join("polygon")
        .attr("pd", d => { return d; })
        .classed("border", true)
        .classed("invalid", d => {
            return invalid_cells.has(d);
        })
        .classed("collinear", d => {
            if (collinear_points == null) return false;
            if (last_border_cell_selected == d) return true;
            return false;
        })
        .classed("winning", d => {
            if (hint && outcomes[d] == (undo_index % 2)) return true;
            return false;
        })
        .classed("losing", d => {
            if (hint && outcomes[d] == 1 - (undo_index % 2)) return true;
            return false;
        })
        .attr("points", d => {
            const ad = JSON.parse(d);
            return shape_class.polygon_corners(layout, ad).map(p => `${p.x.toFixed(0)},${p.y.toFixed(0)}`).join(" ")
        })
        .on("click", (e, d) => {
            if (opponent > 0 && player_order[(undo_index + 1) % 2] == "B") {
                return
            }

            if (last_border_cell_selected == d) {
                collinear_points = null;
                last_border_cell_selected = null;
            } else {
                last_border_cell_selected = d;
                collinear_points = find_collinear(d);
                if (collinear_points == null) {

                    if (instructions.length == undo_index) {
                        // allow a move if its the latest
                        add_cell(d);
                    } else {
                        // otherwise confirm an undo
                        last_border_cell_selected = null;
                        inpUndo.value = d;
                        // set modal attributes (we do not permit undo for Bowser)

                        var modal = new bootstrap.Modal(undoModal);
                        modal.show();
                    }

                } else {
                    set_collinear_line();
                }

            }
            refresh_ui();

        });

    update = g_cells.selectAll("polygon.cell").data(Array.from(set_of_points), (d) => { return d; });
    update.join(
        enter => enter.append("polygon")
            .attr("fill", "green")
            .attr("fill-opacity", 0.2)
            .transition().duration(600)
            .attr("fill", d => {
                const ply = to_play(d);
                if (ply == "A") return cell_fill_a;
                if (ply == "B") return cell_fill_b;
                return cell_fill_start;
            })
            .attr("fill-opacity", 1),
        update => update.attr("fill", d => {
            const ply = to_play(d);
            if (ply == "A") return cell_fill_a;
            if (ply == "B") return cell_fill_b;
            return cell_fill_start;
        })
    )
        .classed("cell", true)
        .classed("collinear", d => {
            if (collinear_points == null) return false;
            if (collinear_points.has(d)) {
                return true;
            }
        })
        .attr("points", d => {
            const ad = JSON.parse(d);
            return shape_class.polygon_corners(layout, ad).map(p => `${p.x.toFixed(0)},${p.y.toFixed(0)}`).join(" ")
        });


    // add the central dot
    update = g_cells.selectAll("circle").data(Array.from(set_of_points), (d) => { return d; });
    update.join(
        // "circle"
        enter => enter.append("circle")
            .attr("r", cell_size / 2)
            .transition().duration(700)
            .attr("r", cell_size / 10)
    )
        // .attr("r", cell_size / 10)
        .attr("cx", d => {
            const ad = JSON.parse(d);
            return shape_class.to_pixel(layout, ad).x.toFixed(0)
        })
        .attr("cy", d => {
            const ad = JSON.parse(d);
            return shape_class.to_pixel(layout, ad).y.toFixed(0)
        });


    // add text for who played the cell
    update = g_cells.selectAll("text").data(Array.from(set_of_points), (d) => { return d; });
    update.join(
        enter => enter.append("text")
            .text(d => {
                return to_play(d);
            })
            .attr("opacity", 1)
            .transition().duration(2500)
            .attr("opacity", d => {
                if (undo_index == instructions.length) return 0; else return 1;
            }),
        update => update
            .attr("opacity", d => {
                if (undo_index == instructions.length) return 0; else return 1;
            })
    )
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("dy", "-1em")
        .attr("font-size", "50%")
        .attr("stroke-width", "0.1")
        .attr("x", d => {
            const ad = JSON.parse(d);
            return shape_class.to_pixel(layout, ad).x.toFixed(0)
        })
        .attr("y", d => {
            const ad = JSON.parse(d);
            return shape_class.to_pixel(layout, ad).y.toFixed(0)
        });


    // add the line
    if (collinear_points == null) {
        collinear_line = [];
    }
    update = g_cells.selectAll("line").data(collinear_line);
    update.join("line")
        .attr("x1", d => {
            return shape_class.to_pixel(layout, d[0]).x.toFixed(0)
        })
        .attr("y1", d => {
            return shape_class.to_pixel(layout, d[0]).y.toFixed(0)
        })
        .attr("x2", d => {
            return shape_class.to_pixel(layout, d[1]).x.toFixed(0)
        })
        .attr("y2", d => {
            return shape_class.to_pixel(layout, d[1]).y.toFixed(0)
        });

    collinear_points = null;

}


function set_layout() {
    wdw_w = window.innerWidth;
    wdw_h = window.innerHeight - header_row.offsetHeight - 10;
    const g_origin = new poly.Point(wdw_w / 2, wdw_h / 2);
    let sz = new poly.Point(cell_size, cell_size);
    layout = new poly.Layout(sz, g_origin);
}


function set_view_box() {
    // Keep the <g> border element central and of optimal size to fill the space
    let box = g_elem.node().getBBox();
    let wdw_r = wdw_h / wdw_w;
    let box_wdw_ratio = box.width / wdw_w;
    let req_h = box.height / box_wdw_ratio;
    let wdw_clip = req_h - wdw_h;
    let extra_width = 0;
    let svg_margin = 1;
    if (wdw_clip > 0) {
        wdw_clip = wdw_clip / wdw_r;
        extra_width = (wdw_clip / 2) * box_wdw_ratio;
        extra_width = extra_width.toFixed(0);
    }

    var
        vb_x = box.x - svg_margin - extra_width,
        vb_y = box.y - svg_margin,
        vb_w = box.width + svg_margin * 2 + extra_width * 2,
        vb_h = box.height + svg_margin * 2;

    svg.transition().attr("viewBox", `${vb_x} ${vb_y} ${vb_w} ${vb_h}`)
}


function set_theme() {
    if (theme == "light") {
        btnThemeText.textContent = "dark_mode";
        document.documentElement.setAttribute("data-bs-theme", "light")
        divGrid.classList.remove("dark");
        header_row.classList.remove("dark");
        sessionStorage.setItem("theme", "light");
    }
    else {
        btnThemeText.textContent = "light_mode";
        document.documentElement.setAttribute("data-bs-theme", "dark")
        divGrid.classList.add("dark");
        header_row.classList.add("dark");
        sessionStorage.setItem("theme", "dark");
    }
}

function to_play(d) {
    var idx = 0;
    for (const ins of instructions) {
        if (JSON.stringify(ins[1]) == d) break;
        idx += 1;
    }
    if (idx == 0) return "";
    return player_order[(idx + 1) % 2];
}

function set_header() {
    if (undo_index != undefined && player_order != undefined) {
        if (player_order[(undo_index + 1) % 2] == "A") {
            radioAToPlay.checked = true;
            playerA.setAttribute("style", `background-color: ${cell_fill_a};`)
            playerB.removeAttribute("style");
        } else {
            radioBToPlay.checked = true;
            playerA.removeAttribute("style");
            playerB.setAttribute("style", `background-color: ${cell_fill_b};`)
        }
    }

    lblScoreA.innerText = "";
    lblScoreB.innerText = "";
    if (score_games.A > 0 || score_games.B > 0) {
        lblScoreA.innerText = score_games.A;
        lblScoreB.innerText = score_games.B;
    }
    if (score_games.A > 0 || score_games.B > 0) {
        lblScoreA.innerText = score_points.A;
        lblScoreB.innerText = score_points.B;
    }

    if (undo_index == instructions.length) {
        lblSize.textContent = set_of_points.size;
    } else {
        lblSize.textContent = `${set_of_points.size} / ${instructions.length}`;
    }
    undoButton.disabled = (undo_index == 1);
    redoButton.disabled = (undo_index == instructions.length);
}

function refresh_grid() {
    set_layout();
    set_shape_class();
    get_instructions();
    set_cell_fill();
    set_points();
    refresh_ui();
}

function refresh_ui() {
    // expects points to be set either from above
    // or an event on grid that has handled updating the point set
    update_grid();
    set_header();
    set_view_box();

    // if its Bowsers turn and we are not undo-ing things
    if (opponent > 0 && player_order[(undo_index + 1) % 2] == "B" && undo_index == instructions.length) {
        lblBowserIcon.classList.add("rotating");
        setTimeout(bowser_start_thinking, 500);
    }
}

function bowser_start_thinking() {
    // generate a default set of bowser options
    var valid_cells, invalid_cells;

    border = get_border(set_of_points);
    [valid_cells, invalid_cells] = get_border_validity(border);
    bowser_options = Array.from(valid_cells);

    // no options then quit - browser lost
    if (bowser_options.length == 0) {
        lblBowserIcon.classList.remove("rotating");
        return;
    }

    if (chkChatty.checked) {
        // show the thinking modal (which can't be closed)
        lblThought.textContent = bt.get_thought();
        modalBowser = new bootstrap.Modal(thinkingModal, {
            backdrop: "static",
            keyboard: false
        });
        modalBowser.show();
    } else {
        // When using the thinking modal this is called by 
        // the event listener for hidden.bs.modal on thinkingModal
        bowser_think(thinking_duration);
    }
}


function bowser_think(ui_delay) {

    var timeout_interval;
    var t0 = 0;
    var t1 = 0;
    if (!hint) {
        t0 = performance.now();
        outcomes = {};
        outcomes = assess_options();
        t1 = performance.now();
    }
    timeout_interval = ui_delay - (t1 - t0);
    if (timeout_interval < 1) {
        bowser_stop_thinking();
    } else {
        setTimeout(bowser_stop_thinking, timeout_interval);
    }

}

function bowser_stop_thinking() {
    lblBowserIcon.classList.remove("rotating");
    if (chkChatty.checked) modalBowser.hide();
    setTimeout(bowser_play, 500);
}

function bowser_play() {

    var win = new Set();
    var lose = new Set();
    var unsure = new Set();
    if (opponent > 1) {
        for (const [d, res] of Object.entries(outcomes)) {
            if (res == (undo_index % 2)) win.add(d);
            if (res == 1 - (undo_index % 2)) lose.add(d);
            if (isNaN(res)) unsure.add(d);
        }
        if (opponent == 2) {
            if (unsure.size > 0) {
                bowser_options = Array.from(unsure);
            } else {
                if (win.size > 0) {
                    bowser_options = Array.from(win);
                }
            }
        }
        if (opponent == 3) {
            if (win.size > 0) {
                bowser_options = Array.from(win);
            } else {
                if (unsure.size > 0) {
                    bowser_options = Array.from(unsure);
                }
            }
        }
    }

    var cell = bowser_options[Math.floor(Math.random() * bowser_options.length)];
    add_cell(cell);
    refresh_ui();
}


function find_collinear(snp, wrt_points) {
    // return a set of points in the points set that are collinear 
    // with the given point (expected in string format)

    const np = JSON.parse(snp);
    if (wrt_points == null) wrt_points = set_of_points;

    var vectors = [];
    for (const ps of wrt_points) {
        var p = JSON.parse(ps);
        const vec = p.map(function (v, j) { return v - np[j] })
        vectors.push(vec);
    }

    // build a dict of sets, each set is a set of parallel vectors
    const orthogonal = {};
    for (const v of vectors) {
        let new_value = true;
        for (const k in orthogonal) {
            var o = JSON.parse(k);
            if (mtx.are_parallel(v, o)) {
                var kv = JSON.stringify(v);
                orthogonal[k].add(kv);
                new_value = false;
                break;
            }
        }
        if (new_value) {
            var kv = JSON.stringify(v);
            orthogonal[JSON.stringify(v)] = new Set([kv]);
        }
    }

    for (const k in orthogonal) {
        o = orthogonal[k];
        if (o.size > collinearity - 1) {
            vectors = Array.from(o);
            var co_points = [snp];
            for (const vs of vectors) {
                var vec = JSON.parse(vs);
                var p = vec.map(function (v, j) { return v + np[j] })
                co_points.push(JSON.stringify(p));
            }
            return new Set(co_points);
        }
    }

    return null;

}

function set_collinear_line() {
    // set the endpoints of the line
    var cps = [];
    var arr = Array.from(collinear_points);
    for (const p of arr) {
        cps.push(JSON.parse(p));
    }
    var max_d = 0;
    for (var i = 0; i < cps.length; i++) {
        for (var j = i + 1; j < cps.length; j++) {
            var p = cps[i];
            var q = cps[j];
            var d = shape_class.manhattan(p, q);
            if (d > max_d) {
                collinear_line = [[p, q]];
                max_d = d;
            }
        }
    }
}

function new_game() {

    engine_depth = default_engine_depth;

    // clear the grid
    sessionStorage.removeItem("nim_instructions");
    sessionStorage.removeItem("nim_undo_index");
    instructions = null;
    undo_index = null;

    // set the variation
    var v = variationChoice.querySelector("[name=variation]:checked").getAttribute("value");
    sessionStorage.setItem("nim_variation", v);
    variation = v;
    lblVariation.textContent = variationLabels[v];

    // set the shape
    shape = lblShape.textContent;
    lblThinkingSpinner.textContent = shape;
    sessionStorage.setItem("nim_shape", shape);

    // set the collinearity
    var v = collinearChoices.querySelector("[name=collinear-options]:checked").getAttribute("value");
    sessionStorage.setItem("nim_collinearity", v);
    collinearity = parseInt(v);
    if (collinearity > 4) engine_depth = 2;

    // set the opponent
    var v = opponentChoices.querySelector("[name=opponent-options]:checked").getAttribute("value");
    sessionStorage.setItem("nim_opponent", v);
    opponent = parseInt(v);
    if (opponent > 0) {
        lblPlayerBName.textContent = opponentLabels[opponent];
        lblBowserIcon.classList.add("d-inline-block")
        lblBowserIcon.classList.remove("d-none")
    } else {
        lblPlayerBName.textContent = playerBName.value;
        lblBowserIcon.classList.remove("d-inline-block")
        lblBowserIcon.classList.add("d-none")
    }

    v = divPlayers.querySelector("[name=who-to-play]:checked").getAttribute("value");
    if (v == "A") v = "AB"; else v = "BA"
    sessionStorage.setItem("nim_player_order", v);
    player_order = v;

}

/*
=========================================================================
Button Events
=========================================================================
*/

/*
Welcome dismiss
*/
btnGotIt.addEventListener("click", () => {
    localStorage.setItem("nim_got_it", true);
});

// Thinking modal visible
thinkingModal.addEventListener("shown.bs.modal", event => {
    bowser_think(modal_thinking_duration);
})

/*
Chatty
*/
chkChatty.addEventListener("click", () => {
    sessionStorage.setItem("nim_chatty", chkChatty.checked);
});


/*
Enough
*/
btnEnough.addEventListener("click", () => {
    chkChatty.checked = false;
    sessionStorage.setItem("nim_chatty", chkChatty.checked);
});


/*
Separate Colours
*/
chkSeparateColours.addEventListener("click", () => {
    sessionStorage.setItem("nim_separate_colours", chkSeparateColours.checked);
    set_cell_fill();
    refresh_grid();
});


/*
Dark Mode theme
*/
btnTheme.addEventListener("click", () => {
    if (theme == "light") {
        theme = "dark";
    } else {
        theme = "light";
    }
    set_theme();
});

/*
Shape 
*/
btnShape.addEventListener("click", () => {
    if (lblShape.textContent == "hexagon") {
        lblShape.textContent = "square";
    } else {
        lblShape.textContent = "hexagon";
    }
});

/*
New Game
*/
btnNew.addEventListener("click", () => {
    // collapse the settings div
    const bsCollapse = bootstrap.Collapse.getInstance("#new-game");
    bsCollapse.hide();
    var divGrid = bootstrap.Collapse.getInstance("#gridId");
    if (divGrid == null) {
        divGrid = new bootstrap.Collapse("#gridId");
    }
    divGrid.show();
    new_game();
    refresh_grid();
});


/*
Undo
*/
undoButton.addEventListener("click", () => {
    if (undo_index > 1) {
        undo_index -= 1;
        sessionStorage.setItem("nim_undo_index", undo_index);
        collinear_points = null;
        last_border_cell_selected = null;
        refresh_grid();
    }
});


/*
Redo
*/
redoButton.addEventListener("click", () => {
    if (undo_index < instructions.length) {
        undo_index += 1;
        sessionStorage.setItem("nim_undo_index", undo_index);
        collinear_points = null;
        last_border_cell_selected = null;
        refresh_grid();
    }
});

/*
Accept result
*/
btnAcceptResult.addEventListener("click", () => {
    var winner = player_order[(undo_index) % 2];
    score_games[winner] += 1;
    sessionStorage.setItem("nim_score_games", JSON.stringify(score_games));

    score_points[winner] += parseInt(lblCellsPlayed.textContent);
    sessionStorage.setItem("nim_score_points", JSON.stringify(score_points));

    if (player_order == "AB") {
        player_order = "BA";
        radioBToPlay.checked = true;
    } else {
        player_order = "AB";
        radioAToPlay.checked = true;
    }
    sessionStorage.setItem("nim_player_order", player_order);
    new_game();
    refresh_grid();
});

/*
Reset Scores
*/
btnResetScores.addEventListener("click", () => {
    score_games = { "A": 0, "B": 0 };
    score_points = { "A": 0, "B": 0 };
    sessionStorage.removeItem("nim_score_games");
    sessionStorage.removeItem("nim_score_points");
    set_header();
});

/*
Name entry
*/
playerAName.oninput = function () {
    lblPlayerAName.textContent = playerAName.value;
    sessionStorage.setItem("nim_A", playerAName.value);
};
playerBName.oninput = function () {
    lblPlayerBName.textContent = playerBName.value;
    sessionStorage.setItem("nim_B", playerBName.value);
};

/*
Who's to play
*/
radioAToPlay.addEventListener("click", () => {
    playerA.setAttribute("style", `background-color: ${cell_fill_a};`)
    playerB.removeAttribute("style");
});

radioBToPlay.addEventListener("click", () => {
    playerA.removeAttribute("style");
    playerB.setAttribute("style", `background-color: ${cell_fill_b};`)
});



/*
Accept Undo
*/
btnAcceptUndo.addEventListener("click", () => {
    add_cell(inpUndo.value);
    refresh_ui();
});

/*
Default separate colours for variation
*/
variationBasic.addEventListener("click", () => {
    chkSeparateColours.checked = false;
    sessionStorage.setItem("nim_separate_colours", false);
});
variationTerritorial1.addEventListener("click", () => {
    chkSeparateColours.checked = true;
    sessionStorage.setItem("nim_separate_colours", true);
});
variationTerritorial2.addEventListener("click", () => {
    chkSeparateColours.checked = true;
    sessionStorage.setItem("nim_separate_colours", true);
});

/*
Opponent
*/
opponent0.addEventListener("click", () => {
    set_opponent(0);
});
opponent1.addEventListener("click", () => {
    set_opponent(1);
});
opponent2.addEventListener("click", () => {
    set_opponent(2);
});
opponent3.addEventListener("click", () => {
    set_opponent(3);
});


/*
=========================================================================
Engine
=========================================================================
*/

var seen;

function get_result(my_points, their_points, depth) {

    // points is a set of point strings
    const points = new Set([...my_points, ...their_points]);
    points.add(JSON.stringify(shape_class.origin));

    // to_play = 0 or 1 indexing the player_order
    var to_play = points.size % 2;

    if (depth == 0) return NaN;

    // check memoise
    var state_string;
    var new_state_string;
    var points_array, my_points_array, their_points_array;
    var valid, invalid, bd;

    // for Basic we don't care who owns the cell
    // but it is meaningful for Territorial
    if (variation == "Basic") {
        points_array = [...points];
        points_array.sort();
    } else {
        my_points_array = [...my_points];
        my_points_array.sort();
        their_points_array = [...their_points];
        their_points_array.sort();
        points_array = Array(2);
        points_array[to_play] = my_points_array;
        points_array[1 - to_play] = their_points_array;
    }
    state_string = JSON.stringify(points_array);
    if (state_string in seen) {
        return seen[state_string];
    }

    // get the valid border cells
    if (variation == "Basic") {
        bd = get_border(points);
        [valid, invalid] = get_border_validity(bd, points);
    } else {
        bd = get_border(points, my_points);
        [valid, invalid] = get_border_validity(bd, points);
    }


    // if no where to go the other player wins
    if (valid.size == 0) return 1 - to_play;

    var unsure = false;
    for (const p of valid) {

        if (variation == "Basic") {
            points_array = [...points];
            points_array.push(p);
            my_points_array = [...my_points];
            my_points_array.push(p);
            points_array.sort();
        } else {
            my_points_array = [...my_points];
            my_points_array.push(p);
            my_points_array.sort();
            points_array = Array(2);
            points_array[1 - to_play] = my_points_array;
            points_array[to_play] = their_points_array;
        }
        new_state_string = JSON.stringify(points_array);

        var res = get_result(their_points, new Set(my_points_array), depth - 1);
        seen[new_state_string] = res;

        // this player can win from here
        if (res == to_play) return to_play;

        if (isNaN(res)) unsure = true;

    }

    // uncertainty 
    if (unsure) return NaN;

    // no uncertainty so other player wins
    return 1 - to_play;

}

function assess_options(depth = engine_depth) {
    var my_points, their_points, points, bd;
    [my_points, their_points] = get_mine_and_theirs();
    points = new Set([...my_points, ...their_points]);
    points.add(JSON.stringify(shape_class.origin));
    seen = {};
    if (variation == "Basic") {
        bd = get_border(points);
    } else {
        bd = get_border(points, my_points);
    }

    var valid;
    var invalid;
    [valid, invalid] = get_border_validity(bd, points);

    var options = {};
    for (const p of valid) {
        var new_points = [...my_points];
        new_points.push(p);
        new_points.sort();
        var r = get_result(their_points, new Set([...new_points]), depth)
        options[p] = r;
    }
    return options
}


/*
=========================================================================
MAIN Script
=========================================================================
*/

function version_upgrade() {
    var s = sessionStorage.getItem("nim_variation");
    if (s == "Territorial") {
        sessionStorage.setItem("nim_variation", "Territorial1");
    }
}

const variationLabels = {
    "Basic": "Basic",
    "Territorial1": "Territorial 1",
    "Territorial2": "Territorial 2",
}

const opponentLabels = [
    "2 Player",
    "Random",
    "Careful",
    "Mindful",
]

const hint = false;
const cell_fill_1 = "steelblue";
const cell_fill_2 = "peru";
const cell_size = 20;
const modal_thinking_duration = 3500;
const thinking_duration = 2000;
const default_engine_depth = 3;

var engine_depth;
var instructions;
var set_of_points;
var border;
var theme;
var undo_index = 0;
var variation;
var opponent;
var shape;
var layout;
var wdw_w;
var wdw_h;
var shape_class;
var collinearity;
var collinear_points;
var last_border_cell_selected;
var collinear_line;
var player_order;
var score_games;
var score_points;
var cell_fill_a;
var cell_fill_b;
var cell_fill_start;
var bowser_options;
var outcomes;
var modalBowser;

// migrate any session/local storage values to the latest version
version_upgrade();

theme = sessionStorage.getItem("theme");
if (theme == null) {
    theme = "dark";
}
set_theme();
get_session();

/*
SVG and graphic elements
*/

d3.select("div#gridId")
    .append("svg")
    // Responsive SVG needs these 2 attributes and no width and height attr.
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 0 0")

var svg = d3.select("svg");
var g_elem = svg.append("g");
var g_border = g_elem.append("g");
var g_cells = g_elem.append("g");

/*
!! Go !!
*/

var seenWelcome = localStorage.getItem("nim_got_it");
if (seenWelcome == null) {
    var modal = new bootstrap.Modal(welcomeModal);
    modal.show();
}

refresh_grid();

