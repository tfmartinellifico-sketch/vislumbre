// Vislumbre — base facial v1 (OpenSCAD)
// Abrir no OpenSCAD e exportar STL para impressão FDM.

$fn = 64;

module face_base() {
  hull() {
    translate([0, 10, 0]) scale([1, 1.15, 0.35]) sphere(r=55);
    translate([0, -35, -5]) scale([0.75, 0.55, 0.25]) sphere(r=40);
  }
}

module magnet_pocket(x, y) {
  translate([x, y, 8]) cylinder(h=3.2, r=4.1);
}

difference() {
  face_base();
  // bolsos rasos para pads (ímã no pad, não na base — opcional na base)
  magnet_pocket(-22, 12);
  magnet_pocket(22, 12);
  magnet_pocket(0, -28);
  magnet_pocket(-30, -8);
  magnet_pocket(30, -8);
}

// placa de apoio
translate([0, 0, -18])
  cube([90, 20, 6], center=true);
