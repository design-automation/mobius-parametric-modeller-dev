import { EEntType, IGeomArrays, TFace, TColl, TPointTree, TPlineTree, TEdgeTree, TVertTree,
    TWireTree, TFaceTree, TPgonTree, TCollTree, TTree, EEntTypeStr } from '../../common';
import { GIGeom } from '../GIGeom';
import { GIGeomNav } from './GIGeomNav';

/**
 * Creating trees
 *
 */
export class GIGeomTree extends GIGeomNav {
    /**
     * Constructor
     */
    constructor(geom: GIGeom, geom_arrays: IGeomArrays) {
        super(geom, geom_arrays);
    }
    /**
     *
     */
    public entEntTree(ent_type: EEntType, ent_i: number): TTree {
        switch (ent_type) {
            case EEntType.VERT:
                return this.getVertTree(ent_i);
            case EEntType.EDGE:
                return this.getEdgeTree(ent_i);
            case EEntType.WIRE:
                return this.getWireTree(ent_i);
            case EEntType.FACE:
                return this.getFaceTree(ent_i);
            case EEntType.POINT:
                return this.getPointTree(ent_i);
            case EEntType.PLINE:
                return this.getPlineTree(ent_i);
            case EEntType.PGON:
                return this.getPgonTree(ent_i);
            case EEntType.COLL:
                return this.getCollTree(ent_i);
        }
    }
    /**
     *
     */
    public getVertTree(vert_i: number): TVertTree {
        const posi_i: number = this._geom_arrays.dn_verts_posis[vert_i];
        return [EEntType.VERT, vert_i, [EEntType.POSI, posi_i]];
    }
    /**
     *
     */
    public getEdgeTree(edge_i: number): TEdgeTree {
        const verts_i: number[] = this._geom_arrays.dn_edges_verts[edge_i];
        const first_posi_i: number = this._geom_arrays.dn_verts_posis[verts_i[0]];
        const second_posi_i: number = this._geom_arrays.dn_verts_posis[verts_i[1]];
        return [EEntType.EDGE, edge_i,
            [EEntType.VERT, verts_i[0], [EEntType.POSI, first_posi_i]],
            [EEntType.VERT, verts_i[1], [EEntType.POSI, second_posi_i]]
        ];
    }
    /**
     *
     */
    public getWireTree(wire_i: number): TWireTree {
        const edges_i: number[] = this._geom_arrays.dn_wires_edges[wire_i];
        const edge_trees: TEdgeTree[] = [];
        for (const edge_i of edges_i) {
            edge_trees.push(this.getEdgeTree(edge_i)); // so we get dup vertices
        }
        return [EEntType.WIRE, wire_i, edge_trees];
    }
    /**
     *
     */
    public getFaceTree(face_i: number): TFaceTree {
        const wirestris: TFace = this._geom_arrays.dn_faces_wirestris[face_i];
        const wire_trees: TWireTree[] = [];
        for (const wire_i of wirestris[0]) { // ignore the tris
            wire_trees.push(this.getWireTree(wire_i));
        }
        return [EEntType.FACE, face_i, wire_trees];
    }
    /**
     *
     */
    public getPointTree(point_i: number): TPointTree {
        const vert_i: number = this._geom_arrays.dn_points_verts[point_i];
        const posi_i: number = this._geom_arrays.dn_verts_posis[vert_i];
        return [EEntType.POINT, point_i, [EEntType.VERT, vert_i, [EEntType.POSI, posi_i]]];
    }
    /**
     *
     */
    public getPlineTree(pline_i: number): TPlineTree {
        const wire_i: number = this._geom_arrays.dn_plines_wires[pline_i];
        return [EEntType.PLINE, pline_i, this.getWireTree(wire_i)];
    }
    /**
     *
     */
    public getPgonTree(pgon_i: number): TPgonTree {
        const face_i: number = this._geom_arrays.dn_pgons_faces[pgon_i];
        return [EEntType.PGON, pgon_i, this.getFaceTree(face_i)];
    }
    /**
     *
     */
    public getCollTree(coll_i: number): TCollTree {
        const coll: TColl = this._geom_arrays.dn_colls_objs[coll_i];
        return [EEntType.COLL, coll_i,
            coll[1].map(point_i => this.getPointTree(point_i)) as TPointTree[],
            coll[2].map(pline_i => this.getPlineTree(pline_i)) as TPlineTree[],
            coll[3].map(pgon_i => this.getPgonTree(pgon_i))  as TPgonTree[]
        ];
    }
    /**
     * Make a pretty string out of an entity tree.
     */
    public entGetPrettyStr(ent_type: EEntType, ent_i: number): string {
        const tree: TTree = this.entEntTree(ent_type, ent_i);
        console.log(tree);
        // ---
        function _pretty(_tree: any[], _indent: number) {
            let _str = '';
            if (Array.isArray(_tree[0])) {
                for (const _item of _tree) {
                    _str += _pretty( _item, _indent);
                }
                return _str;
            }
            const _indent_str = '\n' + ' '.repeat(_indent * 2) + '|';
            _str += _indent_str + EEntType[_tree[0]] + ' ' + EEntTypeStr[_tree[0]] + _tree[1] + ':';
            for (const _tree2 of _tree.slice(2)) {
                if (Array.isArray(_tree2)) {
                    _str += _pretty( _tree2, _indent + 1);
                } else {
                    if (_tree2 !== '') {
                        _str += _indent_str + String(_tree2);
                    }
                }
            }
            return _str;
        }
        // ---
        console.log(JSON.stringify(tree));
        return _pretty(tree, 0);
    }
}
