import * as poly from "./poly.js";
import * as mtx from "./matrix.js";
import { UnionFind } from "./union_find.js"

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
const svgElement = document.getElementById("gridId");
const lblSize = document.getElementById("sizeId");
const header_row = document.getElementById("headerRow");
const undoButton = document.getElementById("btnUndo");
const redoButton = document.getElementById("btnRedo");
const playerAName = document.getElementById("playerAName");
const playerBName = document.getElementById("playerBName");
const lblPlayerAName = document.getElementById("lblPlayerAName");
const lblPlayerBName = document.getElementById("lblPlayerBName");


const setCollinearityButton = document.getElementById("btnSetCollinearity");
const collinearChoices = document.getElementById("collinearChoice");
const collinearModal = document.getElementById("collinearModal");
const welcomeModal = document.getElementById("welcomeModal");


// function set_shape() {
//     // Get in shape
//     if (shape == null) {
//         shape = "hex";
//         var s = sessionStorage.getItem("nim_shape");
//         if (s != null) shape = s;
//     }
//     if (shape == "squ") {
//         lblShape.textContent = "square";
//     } else {
//         lblShape.textContent = "hexagon";
//     }
// }

// function set_collinearity() {
//     if (collinearity == null) {
//         collinearity = 3;
//         var s = sessionStorage.getItem(`${shape}_collinearity`);
//         if (s != null) collinearity = parseInt(s);
//     }
//     maxCollinear.textContent = collinearity.toString();
//     document.getElementById(`co${collinearity}`).checked = true;
// }

function get_session() {
    var pa = sessionStorage.getItem("nim_A");
    if (pa == null) pa = "";
    lblPlayerAName.textContent = pa;
    playerAName.value = pa;

    var pb = sessionStorage.getItem("nim_B");
    if (pb == null) pb = "";
    lblPlayerBName.textContent = pb;
    playerBName.value = pb;

    var s = sessionStorage.getItem("nim_collinearity");
    if (s != null) {
        document.getElementById(`co${s}`).checked = true;
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

function set_points() {
    // create the points set
    set_of_points = new Set();
    for (var i = 0; i < undo_index; i++) {
        var ins = instructions[i];
        if (ins[0] == "+") {
            set_of_points.add(JSON.stringify(ins[1]));
        }
        if (ins[0] == "-") {
            set_of_points.delete(JSON.stringify(ins[1]));
        }
    }
}


function update_grid() {

    var update;

    // generate the border
    border = shape_class.border(set_of_points);

    update = g_border.selectAll("polygon").data(Array.from(border), (d) => { return d; });
    update.join("polygon")
        .classed("invalid", d => {
            var cp = find_collinear(d);
            if (cp == null) {
                return false;
            }
            return true;
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
                        // only allow a move if its the latest
                        instructions.length = undo_index;
                        instructions.push(["+", JSON.parse(d)]);
                        set_of_points.add(d);
                        undo_index += 1;
                        sessionStorage.setItem("nim_instructions", JSON.stringify(instructions));
                        sessionStorage.setItem("nim_undo_index", undo_index);
                    }

                } else {
                    set_collinear_line();
                }

            }
            refresh_ui();

        });

    update = g_cells.selectAll("polygon").data(Array.from(set_of_points), (d) => { return d; });
    update.join(
        enter => enter.append("polygon")
            .attr("fill", "green")
            .attr("fill-opacity", 0.2)
            .transition().duration(600)
            .attr("fill", cell_fill)
            .attr("fill-opacity", 1)
    )
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

    // Code from playominoes that handles selecting cell removal

    // .on("click", (e, d) => {
    //     last_border_cell_selected = null;
    //     if (cell_can_be_removed(d)) {
    //         instructions.length = undo_index;
    //         instructions.push(["-", JSON.parse(d)]);
    //         set_of_points.delete(d);
    //         undo_index += 1;
    //         sessionStorage.setItem(`${shape}_instructions`, JSON.stringify(instructions));
    //         sessionStorage.setItem(`${shape}_undo_index`, undo_index);
    //     } else {
    //         d3.select(e.currentTarget)
    //             .attr("fill", "firebrick")
    //             .transition().duration(1200)
    //             .attr("fill", cell_fill);
    //     }
    //     refresh_ui();
    // });

    // add the central dot
    update = g_cells.selectAll("circle").data(Array.from(set_of_points), (d) => { return d; });
    update.join("circle")
        // update.join(
        //     enter => enter.append("circle").attr("r", cell_size / 2).transition().duration(500).attr("r", cell_size / 10)
        // )
        .attr("r", cell_size / 10)
        .attr("cx", d => {
            const ad = JSON.parse(d);
            return shape_class.to_pixel(layout, ad).x.toFixed(0)
        })
        .attr("cy", d => {
            const ad = JSON.parse(d);
            return shape_class.to_pixel(layout, ad).y.toFixed(0)
        });


    // add the central dot
    update = g_cells.selectAll("text").data(Array.from(set_of_points), (d) => { return d; });
    update.join(
        enter => enter.append("text")
            .text(d => {
                return to_play(d);
            })
            .attr("opacity", 1)
            .transition().duration(1500)
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
        // .attr("fill", "green")
        // .attr("stroke", "green")
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
    let box = g_border.node().getBBox();
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
        svgElement.classList.remove("dark");
        header_row.classList.remove("dark");
        sessionStorage.setItem("theme", "light");
    }
    else {
        btnThemeText.textContent = "light_mode";
        document.documentElement.setAttribute("data-bs-theme", "dark")
        svgElement.classList.add("dark");
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
    if (idx % 2 == 1) return "A"; else return "B";
}

function set_header() {
    const turn_class = "player-to-play";
    if (undo_index % 2 == 1) {
        playerA.classList.add(turn_class);
        playerB.classList.remove(turn_class);
    } else {
        playerA.classList.remove(turn_class);
        playerB.classList.add(turn_class);
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

function find_collinear(snp) {
    // return a set of points in the points set that are collinear 
    // with the given point (expected in string format)

    const np = JSON.parse(snp);

    var vectors = [];
    for (const ps of set_of_points) {
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

function cell_can_be_removed(p) {
    if (set_of_points.size <= 1) return false;

    var arr_of_cells = {};
    var idx = 0;
    for (const c of set_of_points) {
        if (c == p) continue;
        arr_of_cells[c] = idx;
        idx += 1;
    }

    const uf = new UnionFind(set_of_points.size - 1);
    for (const c in arr_of_cells) {
        if (c == p) continue;
        var ci = arr_of_cells[c];
        var ca = JSON.parse(c);
        for (const n of shape_class.neighbours(ca)) {
            var ns = JSON.stringify(n);
            if (ns in arr_of_cells) {
                var ni = arr_of_cells[ns];
                uf.union(ci, ni);
            }
        }
    }
    var r = uf.count() == 1
    return r;
}

/*
=========================================================================
Button Events
=========================================================================
*/

// /*
// Dark Mode theme
// */
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

    // clear the grid
    sessionStorage.removeItem("nim_instructions");
    sessionStorage.removeItem("nim_undo_index");
    instructions = null;
    undo_index = null;

    // set the shape
    shape = lblShape.textContent
    sessionStorage.setItem("nim_shape", shape);

    // set the collinearity
    var v = collinearChoices.querySelector("[name=collinear-options]:checked").getAttribute("value");
    sessionStorage.setItem("nim_collinearity", v);
    collinearity = parseInt(v);

    // collapse the settings div
    const bsCollapse = bootstrap.Collapse.getInstance("#new-game");
    bsCollapse.hide();
    refresh_grid();
});

// /*
// Undo
// */
undoButton.addEventListener("click", () => {
    if (undo_index > 1) {
        undo_index -= 1;
        sessionStorage.setItem("nim_undo_index", undo_index);
        collinear_points = null;
        last_border_cell_selected = null;
        refresh_grid();
    }
});


// /*
// Redo
// */
redoButton.addEventListener("click", () => {
    if (undo_index < instructions.length) {
        undo_index += 1;
        sessionStorage.setItem("nim_undo_index", undo_index);
        collinear_points = null;
        last_border_cell_selected = null;
        refresh_grid();
    }
});

// /*
// Collinearity
// */
// setCollinearityButton.addEventListener("click", () => {
//     var v = collinearChoices.querySelector("[name=collinear-options]:checked").getAttribute("value");
//     var modal = bootstrap.Modal.getInstance(collinearModal)
//     modal.hide();

//     sessionStorage.setItem(`${shape}_collinearity`, v);
//     collinearity = null;
//     set_collinearity();

//     collinear_points = null;
//     last_border_cell_selected = null;

//     refresh_grid();
// });


playerAName.oninput = function () {
    lblPlayerAName.textContent = playerAName.value;
    sessionStorage.setItem("nim_A", playerAName.value);
};
playerBName.oninput = function () {
    lblPlayerBName.textContent = playerBName.value;
    sessionStorage.setItem("nim_B", playerBName.value);
};


/*
=========================================================================
MAIN Script
=========================================================================
*/

const cell_fill = "steelblue";
const cell_size = 20;
var instructions;
var set_of_points;
var border;
var theme;
var undo_index = 0;
var shape;
var layout;
var wdw_w;
var wdw_h;
var shape_class;
var collinearity;
var collinear_points;
var last_border_cell_selected;
var collinear_line;

theme = sessionStorage.getItem("theme");
if (theme == null) {
    theme = "dark";
}
set_theme();
// set_shape();
get_session();

/*
SVG and graphic elements
*/

d3.select("div#gridId")
    .append("svg")
    // Responsive SVG needs these 2 attributes and no width and height attr.
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 0 0")

var svg = d3.select("svg"),
    g_border = svg.append("g").classed("border", true),
    g_cells = svg.append("g").classed("cell", true);

/*
!! Go !!
*/

var seenWelcome = localStorage.getItem("seenWelcome");
if (seenWelcome == null) {
    localStorage.setItem("seenWelcome", true);
    var modal = new bootstrap.Modal(welcomeModal);
    modal.show();
}

refresh_grid();

