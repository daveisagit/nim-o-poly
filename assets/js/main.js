import * as poly from "./poly.js";
import * as mtx from "./matrix.js";

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
const chkSeparateColours = document.getElementById("chkSeparateColours");
const lblVariation = document.getElementById("lblVariation");
const variationChoice = document.getElementById("variationChoice");
const variationBasic = document.getElementById("variationBasic");
const variationTerritorial1 = document.getElementById("variationTerritorial1");
const variationTerritorial2 = document.getElementById("variationTerritorial2");

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

    // Shape
    if (shape == null) {
        shape = "hexagon";
        s = sessionStorage.getItem("nim_shape");
        if (s != null) shape = s;
    }
    lblShape.textContent = shape;

    // Collinearity
    if (collinearity == null) {
        collinearity = 3;
        s = sessionStorage.getItem("nim_collinearity");
        if (s != null) {
            document.getElementById(`co${s}`).checked = true;
            collinearity = parseInt(s);
        }
    }

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

function set_my_points() {
    // create the points set
    // my_points = new Set([JSON.stringify(shape_class.origin)]);
    my_points = new Set();
    if (undo_index <= 2 || variation == "Territorial1") {
        my_points.add(JSON.stringify(shape_class.origin));
    }
    for (var i = 1; i < undo_index; i++) {
        var ins = instructions[i];
        if ((undo_index - i) % 2 == 0) {
            my_points.add(JSON.stringify(ins[1]));
        }
    }
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

function get_border(points) {
    // generate the border
    if (variation == "Basic") {
        return shape_class.border(points);
    } else {
        set_my_points();
        if (undo_index <= 2 || variation == "Territorial1") {
            return shape_class.border(my_points, points);
        } else {
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
    var outcomes = {};

    // generate the border and which are not valid
    border = get_border(set_of_points);
    [valid_cells, invalid_cells] = get_border_validity(border);

    // we have a winner
    if (valid_cells.size == 0) {
        var winner = player_order[(undo_index) % 2];
        lblWinner.textContent = winner;
        if (winner == "A") {
            lblWinnersName.textContent = lblPlayerAName.textContent;
        } else {
            lblWinnersName.textContent = lblPlayerBName.textContent;
        }
        lblCellsPlayed.textContent = undo_index;
        var modal = new bootstrap.Modal(winnerModal);
        modal.show();
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
        .attr("points", d => {
            const ad = JSON.parse(d);
            return shape_class.polygon_corners(layout, ad).map(p => `${p.x.toFixed(0)},${p.y.toFixed(0)}`).join(" ")
        })
        .on("click", (e, d) => {

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
    update.join("circle")
        .attr("r", cell_size / 10)
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
    if (player_order[(undo_index + 1) % 2] == "A") {
        radioAToPlay.checked = true;
        playerA.setAttribute("style", `background-color: ${cell_fill_a};`)
        playerB.removeAttribute("style");
    } else {
        radioBToPlay.checked = true;
        playerA.removeAttribute("style");
        playerB.setAttribute("style", `background-color: ${cell_fill_b};`)
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
    shape = lblShape.textContent
    sessionStorage.setItem("nim_shape", shape);

    // set the collinearity
    var v = collinearChoices.querySelector("[name=collinear-options]:checked").getAttribute("value");
    sessionStorage.setItem("nim_collinearity", v);
    collinearity = parseInt(v);

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

const cell_fill_1 = "steelblue";
const cell_fill_2 = "peru";
const cell_size = 20;
var instructions;
var set_of_points;
var my_points;
var border;
var theme;
var undo_index = 0;
var variation;
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

var seenWelcome = localStorage.getItem("nim_welcome");
if (seenWelcome == null) {
    localStorage.setItem("nim_welcome", true);
    var modal = new bootstrap.Modal(welcomeModal);
    modal.show();
}

refresh_grid();

