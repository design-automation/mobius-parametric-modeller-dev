import { SIModel } from '@assets/libs/sim/SIModel';
import { CesiumSettings } from '../gi-cesium-viewer.settings';
import { EEntType, Txyz, TAttribDataTypes, LONGLAT } from '@libs/sim/common';
// import { HereMapsImageryProvider } from './HereMapsImageryProvider.js';
/**
 * Cesium data
 */
export class DataCesium {
    public _viewer: any;
    // the GI model to display
    public _model: SIModel;
    // Cesium Settings
    public settings: CesiumSettings;
    // Cesium scene
    // public _scene: THREE.Scene; // TODO switch with Cesium viewer
    // text to display
    public _text: string;
    public _primitives: any[];
    public _camera: any[];
    // interaction and selection
    // text labels
    // number of cesium points, lines, triangles
    // grid
    // axes
    /**
     * Constructs a new data subscriber.
     */
    constructor(settings: CesiumSettings) {
        this.settings = settings;
        // renderer
        // camera settings
        // orbit controls
        // mouse
        // selecting
        // add grid
        // add lights
    }
    // matrix points from xyz to long lat
    /**
     *
     */
    public createCesiumViewer() {
        // add Cesium Access Token
        Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' +
                                        '.eyJqdGkiOiI2MGMxNGYwMS1jZjYyLTQyNjM' +
                                        'tOGNkYy1hOTRiYTk4ZGEzZDUiLCJpZCI6MTY' +
                                        '4MSwiaWF0IjoxNTI5NTY4OTc4fQ.lL2fzwOZ' +
                                        '6EQuL5BqXG5qIwlBn-P_DTbClhVYCIyCgS0';
        // create the viewer
        // https://cesiumjs.org/Cesium/Build/Documentation/Viewer.html
        // https://cesium.com/docs/tutorials/getting-started/
        // https://cesium.com/blog/2018/03/12/cesium-and-angular/
        const view_models = this._getImageryViewModels();
        this._viewer = new Cesium.Viewer(
            document.getElementById('cesium-container'),
            {
                shadows : true,
                terrainShadows: Cesium.ShadowMode.ENABLED,
                scene3DOnly: false,
                sceneModePicker: false,
                homeButton: true,
                navigationHelpButton: false,
                fullscreenButton: false,
                animation: false,
                timeline: false,
                geocoder: false,
                imageryProviderViewModels : view_models,
                selectedImageryProviderViewModel : view_models[0],
                // terrainProviderViewModels : terrainViewModels
                // selectedTerrainProviderViewModel : terrainViewModels[1]
            }
        );
        this._viewer.scene.globe.depthTestAgainstTerrain = true;
        this._viewer.clock.currentTime.secondsOfDay = 50000;
        this._viewer.shadowMap.maxmimumDistance = 10000.0;
        this._viewer.shadowMap.size = 2048;
        this._viewer.shadowMap.softShadows = false; // if true, causes some strange effects
        // document.getElementsByClassName('cesium-viewer-bottom')[0].remove();

        // prevent camera goes underground #375
        const handler = this._viewer.screenSpaceEventHandler;
        handler.setInputAction(() => {
            this._viewer.camera._suspendTerrainAdjustment = false;
            this._viewer.camera._adjustHeightForTerrain();
        }, Cesium.ScreenSpaceEventType.MIDDLE_DOWN);

        // change camera controlling action: left mouse drag for rotating, right mouse drag for panning, wheel for zooming
        const cameraController = this._viewer.scene.screenSpaceCameraController;

        cameraController.rotateEventTypes = Cesium.CameraEventType.LEFT_DRAG;
        cameraController.tiltEventTypes  = Cesium.CameraEventType.LEFT_DRAG;
        cameraController.translateEventTypes = Cesium.CameraEventType.RIGHT_DRAG;
        // cameraController.lookEventTypes = [Cesium.CameraEventType.RIGHT_DRAG,
        //                                     {'eventType': Cesium.CameraEventType.LEFT_DRAG,
        //                                      'modifier': Cesium.KeyboardEventModifier.SHIFT}];
        cameraController.lookEventTypes = Cesium.CameraEventType.RIGHT_DRAG;
        cameraController.zoomEventTypes  = [  Cesium.CameraEventType.MIDDLE_DRAG,
                                                Cesium.CameraEventType.WHEEL,
                                                Cesium.CameraEventType.PINCH];

        Cesium.Camera.DEFAULT_VIEW_FACTOR = 0;

        if (this._primitives) {
            this._viewer.scene.primitives.removeAll();
            for (const primitive of this._primitives) {
                this._viewer.scene.primitives.add(Cesium.clone(primitive));
            }
            this._viewer.camera.viewBoundingSphere(this._camera[0]);
            this._viewer.camera.direction = this._camera[1].direction;
            this._viewer.camera.position = this._camera[1].position;
            this._viewer.camera.right = this._camera[1].right;
            this._viewer.camera.up = this._camera[1].up;
            this._viewer.render();
        }

        const homeBtn = document.getElementsByClassName('cesium-home-button')[0];
        // tslint:disable-next-line
        homeBtn.getElementsByTagName('path')[0].setAttribute('d', 'M15 3l2.3 2.3-2.89 2.87 1.42 1.42L18.7 6.7 21 9V3zM3 9l2.3-2.3 2.87 2.89 1.42-1.42L6.7 5.3 9 3H3zm6 12l-2.3-2.3 2.89-2.87-1.42-1.42L5.3 17.3 3 15v6zm12-6l-2.3 2.3-2.87-2.89-1.42 1.42 2.89 2.87L15 21h6z');
        // settings button
        const settingsBtn = homeBtn.nextElementSibling;
        settingsBtn.getElementsByTagName('img')[0].remove();
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        // tslint:disable-next-line
        path.setAttribute('d', 'M19.43 12.98c.04-.32.07-.64.07-.98 0-.34-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.09-.16-.26-.25-.44-.25-.06 0-.12.01-.17.03l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.06-.02-.12-.03-.18-.03-.17 0-.34.09-.43.25l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98 0 .33.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.09.16.26.25.44.25.06 0 .12-.01.17-.03l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.06.02.12.03.18.03.17 0 .34-.09.43-.25l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zm-1.98-1.71c.04.31.05.52.05.73 0 .21-.02.43-.05.73l-.14 1.13.89.7 1.08.84-.7 1.21-1.27-.51-1.04-.42-.9.68c-.43.32-.84.56-1.25.73l-1.06.43-.16 1.13-.2 1.35h-1.4l-.19-1.35-.16-1.13-1.06-.43c-.43-.18-.83-.41-1.23-.71l-.91-.7-1.06.43-1.27.51-.7-1.21 1.08-.84.89-.7-.14-1.13c-.03-.31-.05-.54-.05-.74s.02-.43.05-.73l.14-1.13-.89-.7-1.08-.84.7-1.21 1.27.51 1.04.42.9-.68c.43-.32.84-.56 1.25-.73l1.06-.43.16-1.13.2-1.35h1.39l.19 1.35.16 1.13 1.06.43c.43.18.83.41 1.23.71l.91.7 1.06-.43 1.27-.51.7 1.21-1.07.85-.89.7.14 1.13zM12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z')
        svg.append(path);
        settingsBtn.append(svg);

        // const btn = document.getElementById('attribToggle');
        // if (btn) {
        //     btn.style.display = 'none';
        // }
    }
    /**
     *
     * @param model
     * @param container
     */
    public addGeometry(model: SIModel, container: any): void { // TODO delete container
        this._viewer.scene.primitives.removeAll();
        // the origin of the model
        let longitude = LONGLAT[0];
        let latitude = LONGLAT[1];
        if (model.attribs.query.hasModelAttrib('geolocation')) {
            const geoloc: any = model.attribs.query.getModelAttribVal('geolocation');
            const long_value: TAttribDataTypes  = geoloc.longitude;
            if (typeof long_value !== 'number') {
                throw new Error('Longitude attribute must be a number.');
            }
            longitude = long_value as number;
            if (longitude < -180 || longitude > 180) {
                throw new Error('Longitude attribute must be between -180 and 180.');
            }
            const lat_value: TAttribDataTypes = geoloc.latitude;
            if (typeof lat_value !== 'number') {
                throw new Error('Latitude attribute must be a number');
            }
            latitude = lat_value as number;
            if (latitude < 0 || latitude > 90) {
                throw new Error('Latitude attribute must be between 0 and 90.');
            }
        }
        // if (model.attribs.query.hasModelAttrib('longitude')) {
        //     const long_value: TAttribDataTypes  = model.attribs.query.getModelAttribVal('longitude');
        //     if (typeof long_value !== 'number') {
        //         throw new Error('Longitude attribute must be a number.');
        //     }
        //     longitude = long_value as number;
        //     if (longitude < -180 || longitude > 180) {
        //         throw new Error('Longitude attribute must be between -180 and 180.');
        //     }
        // }
        // if (model.attribs.query.hasModelAttrib('latitude')) {
        //     const lat_value: TAttribDataTypes = model.attribs.query.getModelAttribVal('latitude');
        //     if (typeof lat_value !== 'number') {
        //         throw new Error('Latitude attribute must be a number');
        //     }
        //     latitude = lat_value as number;
        //     if (latitude < 0 || latitude > 90) {
        //         throw new Error('Latitude attribute must be between 0 and 90.');
        //     }
        // }
        const origin = Cesium.Cartesian3.fromDegrees(longitude, latitude);
        // create a matrix to transform points
        const xform_matrix: any = Cesium.Matrix4.multiplyByTranslation(
            Cesium.Transforms.eastNorthUpToFixedFrame(origin),
            new Cesium.Cartesian3(0, 0, 1),
            new Cesium.Matrix4()
        );
        // create all positions
        const posis_i: number[] = model.geom.data.getEnts(EEntType.POSI, false);
        const posi_to_point_map: Map<number, any> = new Map();
        for (const posi_i of posis_i) {
            if (!posi_to_point_map.has(posi_i)) {
                const xyz: Txyz = model.attribs.query.getPosiCoords(posi_i);
                const pnt: any = Cesium.Cartesian3.fromArray(xyz);
                const xform_pnt: any = new Cesium.Cartesian3();
                Cesium.Matrix4.multiplyByPoint(xform_matrix, pnt, xform_pnt);
                posi_to_point_map.set(posi_i, xform_pnt);
            }
        }
        // add geom
        if (model) {
            // get each polygon
            const pgons_i: number[] = model.geom.data.getEnts(EEntType.PGON, false);
            // get each triangle
            const lines_instances: any[] = [];
            const tris_instances: any[] = [];
            for (const pgon_i of pgons_i) {
                // get the colour of the vertices
                let pgon_colour = Cesium.Color.WHITE;
                if (model.attribs.query.hasAttrib(EEntType.VERT, 'rgb')) {
                    const verts_i: number[] = model.geom.data.navAnyToVert(EEntType.PGON, pgon_i);
                    const rgb_sum: Txyz = [0, 0, 0];
                    for (const vert_i of verts_i) {
                        let vert_rgb: Txyz = model.attribs.query.getAttribVal(EEntType.VERT, 'rgb', vert_i) as Txyz;
                        if (!vert_rgb) { vert_rgb = [1, 1, 1]; }
                        rgb_sum[0] = rgb_sum[0] + vert_rgb[0];
                        rgb_sum[1] = rgb_sum[1] + vert_rgb[1];
                        rgb_sum[2] = rgb_sum[2] + vert_rgb[2];
                    }
                    const num_verts: number = verts_i.length;
                    pgon_colour = new Cesium.Color(rgb_sum[0] / num_verts, rgb_sum[1] / num_verts, rgb_sum[2] / num_verts, 1.0);
                }
                // create the edges
                // const wires_i: number[] = model.geom.nav.navAnyToWire(EEntType.PGON, pgon_i);
                // for (const wire_i of wires_i) {
                //     const wire_posis_i: number[] = model.geom.nav.navAnyToPosi(EEntType.WIRE, wire_i);
                //     if (wire_posis_i.length > 2) {
                //         // const wire_verts_i: number[] = model.geom.nav.navAnyToVert(EEntType.WIRE, wire_i);
                //         // const wire_posis_i: number[] = wire_verts_i.map( wire_vert_i => model.geom.nav.navVertToPosi(wire_vert_i) );
                //         const wire_points: any[] = wire_posis_i.map( wire_posi_i => posi_to_point_map.get(wire_posi_i) );
                //         if (model.geom.query.istWireClosed(wire_i)) {
                //             wire_points.push(wire_points[0]);
                //         }
                //         const line_geom = new Cesium.SimplePolylineGeometry({
                //             positions: wire_points,
                //             vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
                //             perPositionHeight: true,
                //             // arcType: Cesium.ArcType.NONE,
                //             width: 1.0
                //         });
                //         const line_instance = new Cesium.GeometryInstance({
                //             geometry : line_geom,
                //             attributes : {
                //                 color : Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.BLACK)
                //             }
                //         });
                //         lines_instances.push(line_instance);
                //     }
                // }

                // create the triangles
                const pgon_tris_i: number[] = model.geom.data.navAnyToTri(EEntType.PGON, pgon_i);
                for (const pgon_tri_i of pgon_tris_i) {
                    // tris_i.push(pgon_tri_i);
                    const tri_posis_i: number[] = model.geom.data.navAnyToPosi(EEntType.TRI, pgon_tri_i);
                    const tri_points: any[] = tri_posis_i.map( posi_i => posi_to_point_map.get(posi_i) );
                    const tri_geom = new Cesium.PolygonGeometry({
                        perPositionHeight : true,
                        polygonHierarchy: new Cesium.PolygonHierarchy(tri_points),
                        vertexFormat : Cesium.PerInstanceColorAppearance.VERTEX_FORMAT
                    });
                    const instance = new Cesium.GeometryInstance({
                        geometry : tri_geom,
                        attributes : {
                            color : Cesium.ColorGeometryInstanceAttribute.fromColor(pgon_colour)
                        }
                    });
                    tris_instances.push(instance);
                }
            }
            // get each polygon
            const plines_i: number[] = model.geom.data.getEnts(EEntType.PLINE, false);
            // get each pline
            for (const pline_i of plines_i) {
                let pline_colour = Cesium.Color.BLACK;
                if (model.attribs.query.hasAttrib(EEntType.VERT, 'rgb')) {
                    const verts_i: number[] = model.geom.data.navAnyToVert(EEntType.PLINE, pline_i);
                    const rgb_sum: Txyz = [0, 0, 0];
                    for (const vert_i of verts_i) {
                        let vert_rgb: Txyz = model.attribs.query.getAttribVal(EEntType.VERT, 'rgb', vert_i) as Txyz;
                        if (!vert_rgb) { vert_rgb = [0, 0, 0]; }
                        rgb_sum[0] = rgb_sum[0] + vert_rgb[0];
                        rgb_sum[1] = rgb_sum[1] + vert_rgb[1];
                        rgb_sum[2] = rgb_sum[2] + vert_rgb[2];
                    }
                    const num_verts: number = verts_i.length;
                    pline_colour = new Cesium.Color(rgb_sum[0] / num_verts, rgb_sum[1] / num_verts, rgb_sum[2] / num_verts, 1.0);
                }
                // create the edges
                const wire_i: number = model.geom.data.navPlineToWire(pline_i);
                const wire_posis_i: number[] = model.geom.data.navAnyToPosi(EEntType.WIRE, wire_i);
                if (wire_posis_i.length > 1) {
                    const wire_points: any[] = wire_posis_i.map( wire_posi_i => posi_to_point_map.get(wire_posi_i) );
                    if (model.geom.data.wireIsClosed(wire_i)) {
                        wire_points.push(wire_points[0]);
                    }
                    const line_geom = new Cesium.SimplePolylineGeometry({
                        positions: wire_points,
                        vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
                        perPositionHeight: true,
                        // arcType: Cesium.ArcType.NONE,
                        width: 1.0
                    });
                    const line_instance = new Cesium.GeometryInstance({
                        geometry : line_geom,
                        attributes : {
                            color : Cesium.ColorGeometryInstanceAttribute.fromColor(pline_colour)
                        }
                    });
                    lines_instances.push(line_instance);
                }
            }
            const lines_primitive = new Cesium.Primitive({
                                        allowPicking: false,
                                        geometryInstances : lines_instances,
                                        shadows : Cesium.ShadowMode.DISABLED,
                                        appearance : new Cesium.PerInstanceColorAppearance({
                                            flat: true,
                                            translucent : false
                                        })
                                    });
            const tris_primitive =  new Cesium.Primitive({
                                        allowPicking: true,
                                        geometryInstances : tris_instances,
                                        shadows : Cesium.ShadowMode.ENABLED,
                                        appearance : new Cesium.PerInstanceColorAppearance({
                                            translucent : false
                                        })
                                    });
            // this._primitives = [tris_primitive];
            this._primitives = [lines_primitive, tris_primitive];
            for (const primitive of this._primitives) {
                this._viewer.scene.primitives.add(Cesium.clone(primitive));
            }

            // const sphere = new Cesium.BoundingSphere(origin, 1e2);
            // this._viewer.camera.viewBoundingSphere(sphere);
            // this._camera = [sphere, this._viewer.camera];

            // if (!this._camera) {
                // set up the camera
                const sphere = new Cesium.BoundingSphere(origin, 1e2);
                this._viewer.camera.viewBoundingSphere(sphere);
                this._camera = [sphere, this._viewer.camera];
            // }


            const extent = Cesium.Rectangle.fromDegrees(
                longitude - 0.01, latitude - 0.01,
                longitude + 0.01, latitude + 0.01); // 100.3, 5.4, 100.4, 5.5);

            Cesium.Camera.DEFAULT_VIEW_RECTANGLE = extent;
            // Cesium.Camera.DEFAULT_VIEW_FACTOR = 0;

            this._viewer.render();
        }
    }
    // PRIVATE METHODS
    /**
     * Get a set of image layers
     */
    private _getImageryViewModels(): any[] {
        const view_models: any[] = [];
        // view_models.push(new Cesium.ProviderViewModel({
        //     name: 'Here Map',
        //     iconUrl: Cesium.buildModuleUrl('Widgets/Images/ImageryProviders/openStreetMap.png'),
        //     tooltip: 'OpenStreetMap (OSM) is a collaborative project to create a free editable \
        //          map of the world.\nhttp://www.openstreetmap.org',
        //     creationFunction: function () {
        //         return new Cesium.HereMapsImageryProvider({
        //             appId: 'r4wDXkIdwoefnLKzNBmn',
        //             appCode: 'VknnhofMzg10PmECHFXHaw'
        //         });
        //     },
        // }));
        view_models.push(new Cesium.ProviderViewModel({
            name: 'Open\u00adStreet\u00adMap',
            iconUrl: Cesium.buildModuleUrl('Widgets/Images/ImageryProviders/openStreetMap.png'),
            tooltip: 'OpenStreetMap (OSM) is a collaborative project to create a free editable \
                 map of the world.\nhttp://www.openstreetmap.org',
            creationFunction: function () {
                return Cesium.createOpenStreetMapImageryProvider({
                    url: 'https://a.tile.openstreetmap.org/',
                });
            },
        }));
        view_models.push(new Cesium.ProviderViewModel({
            name: 'Stamen Toner',
            iconUrl: Cesium.buildModuleUrl('Widgets/Images/ImageryProviders/stamenToner.png'),
            tooltip: 'A high contrast black and white map.\nhttp://www.maps.stamen.com/',
            creationFunction: function () {
                return Cesium.createOpenStreetMapImageryProvider({
                    url: 'https://stamen-tiles.a.ssl.fastly.net/toner/',
                });
            },
        }));
        view_models.push(new Cesium.ProviderViewModel({
            name: 'Stamen Toner(Lite)',
            iconUrl: Cesium.buildModuleUrl('Widgets/Images/ImageryProviders/stamenToner.png'),
            tooltip: 'A high contrast black and white map(Lite).\nhttp://www.maps.stamen.com/',
            creationFunction: function () {
                return Cesium.createOpenStreetMapImageryProvider({
                    url: 'https://stamen-tiles.a.ssl.fastly.net/toner-lite/',
                });
            },
        }));
        view_models.push(new Cesium.ProviderViewModel({
            name: 'Terrain(Standard)',
            iconUrl: Cesium.buildModuleUrl('Widgets/Images/TerrainProviders/CesiumWorldTerrain.png'),
            tooltip: 'A high contrast black and white map(Standard).\nhttp://www.maps.stamen.com/',
            creationFunction: function () {
                return Cesium.createOpenStreetMapImageryProvider({
                    url: 'https://stamen-tiles.a.ssl.fastly.net/terrain/',
                });
            },
        }));
        view_models.push(new Cesium.ProviderViewModel({
            name: 'Terrain(Background)',
            iconUrl: Cesium.buildModuleUrl('Widgets/Images/TerrainProviders/CesiumWorldTerrain.png'),
            tooltip: 'A high contrast black and white map(Background).\nhttp://www.maps.stamen.com/',
            creationFunction: function () {
                return Cesium.createOpenStreetMapImageryProvider({
                    url: 'https://stamen-tiles.a.ssl.fastly.net/terrain-background/',
                });
            },
        }));
        // view_models.push(new Cesium.ProviderViewModel({
        //     name: "Earth at Night",
        //     iconUrl: Cesium.buildModuleUrl("Widgets/Images/ImageryProviders/earthAtNight.png"),
        //     tooltip: "The lights of cities and villages trace the outlines of civilization \
        //              in this global view of the Earth at night as seen by NASA/NOAA\'s Suomi NPP satellite.",
        //     creationFunction: function () {
        //         return new Cesium.IonImageryProvider({ assetId: 3812 });
        //     },
        // }));
        // view_models.push(new Cesium.ProviderViewModel({
        //     name: "Natural Earth\u00a0II",
        //     iconUrl: Cesium.buildModuleUrl("Widgets/Images/ImageryProviders/naturalEarthII.png"),
        //     tooltip: "Natural Earth II, darkened for contrast.\nhttp://www.naturalearthdata.com/",
        //     creationFunction: function () {
        //         return Cesium.createTileMapServiceImageryProvider({
        //             url: Cesium.buildModuleUrl("Assets/Textures/NaturalEarthII"),
        //         });
        //     },
        // }));
        // view_models.push(new Cesium.ProviderViewModel({
        //     name: "Blue Marble",
        //     iconUrl: Cesium.buildModuleUrl("Widgets/Images/ImageryProviders/blueMarble.png"),
        //     tooltip: "Blue Marble Next Generation July, 2004 imagery from NASA.",
        //     creationFunction: function () {
        //         return new Cesium.IonImageryProvider({ assetId: 3845 });
        //     },
        // }));
        return view_models;
    }
}

