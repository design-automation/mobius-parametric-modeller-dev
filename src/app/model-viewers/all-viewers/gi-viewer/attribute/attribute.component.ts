import { Component, Injector, Input, OnChanges, SimpleChanges, ViewChildren, QueryList, Output, EventEmitter } from '@angular/core';
import { MatTableDataSource, MatSort, MatPaginator, Sort } from '@angular/material';
import { GIModel } from '@libs/geo-info/GIModel';
import { DataService } from '../data/data.service';
import { GICommon } from '@libs/geo-info';
import { EEntType, EEntTypeStr } from '@libs/geo-info/common';
import { GIAttribsThreejs } from '@assets/libs/geo-info/GIAttribsThreejs';

@Component({
  selector: 'attribute',
  templateUrl: './attribute.component.html',
  styleUrls: ['./attribute.component.scss']
})

export class AttributeComponent implements OnChanges {
  @Input() data: GIModel;
  @Input() refresh: Event;
  @Input() reset: Event;
  @Output() attrTableSelect = new EventEmitter<Object>();
  showSelected = false;

  tabs: { type: number, title: string }[] =
    [
      { type: EEntType.POSI, title: 'Positions' },
      { type: EEntType.VERT, title: 'Vertices' },
      { type: EEntType.EDGE, title: 'Edges' },
      { type: EEntType.WIRE, title: 'Wires' },
      { type: EEntType.FACE, title: 'Faces' },
      { type: EEntType.POINT, title: 'Points' },
      { type: EEntType.PLINE, title: 'Polylines' },
      { type: EEntType.PGON, title: 'Polygons' },
      { type: EEntType.COLL, title: 'Collections' },
      { type: EEntType.MOD, title: 'Model' }
    ];
  displayedColumns: string[] = [];
  displayData: {}[] = [];
  selected_ents = new Map();

  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();

  dataSource: MatTableDataSource<object>;

  protected dataService: DataService;

  constructor(injector: Injector) {
    this.dataService = injector.get(DataService);
    if (localStorage.getItem('mpm_attrib_current_tab') === null) {
      localStorage.setItem('mpm_attrib_current_tab', '0');
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && this.data) {
      this.refreshTable();
    }
    if (changes['reset']) {
      this.resetTable();
    }
    if (changes['refresh']) {
      this.refreshTable();
    }
  }

  generateTable(tabIndex: number) {
    const EntityType = GICommon.EEntType;
    const tab_map = {
      0: EntityType.POSI,
      1: EntityType.VERT,
      2: EntityType.EDGE,
      3: EntityType.WIRE,
      4: EntityType.FACE,
      5: EntityType.POINT,
      6: EntityType.PLINE,
      7: EntityType.PGON,
      8: EntityType.COLL,
      9: EntityType.MOD
    };
    if (this.data) {
      const ThreeJSData = this.data.attribs.threejs;
      if (Number(tabIndex) === 9) {
        this.displayData = ThreeJSData.getModelAttribsForTable();
      } else {
        const ready = this.data.attribs.threejs instanceof GIAttribsThreejs;
        this.selected_ents = this.dataService.selected_ents.get(EEntTypeStr[tab_map[tabIndex]]);

        if (!ready) { return; }
        if (this.showSelected) {
          const SelectedAttribData = ThreeJSData.getEntsVals(this.selected_ents, tab_map[tabIndex]);
          this.displayData = SelectedAttribData;
        } else {
          const AllAttribData = ThreeJSData.getAttribsForTable(tab_map[tabIndex]);
          AllAttribData.map(row => {
            if (this.selected_ents.has(row.id)) {
              return row.selected = true;
            }
          });
          this.displayData = AllAttribData;
        }
      }
      if (this.displayData.length > 0) {
        const columns = Object.keys(this.displayData[0]).filter(e => e !== 'selected');
        const first = columns.shift();
        const selected = columns.find(column => column.substr(0, 1) === '_');
        const rest_of_columns = columns.filter(column => column.substr(0, 1) !== '_');
        const new_columns = selected ? [first, selected, ...rest_of_columns] : [first, ...rest_of_columns];
        this.displayedColumns = new_columns;
        this.dataSource = new MatTableDataSource<object>(this.displayData);
      } else {
        this.displayedColumns = [];
        this.dataSource = new MatTableDataSource<object>();
      }
      this.dataSource.paginator = this.paginator.toArray()[tabIndex];
      this.dataSource.sort = this.sort.toArray()[tabIndex];
    }
    return tabIndex;
  }

  _setDataSource(tabIndex: number) {
    setTimeout(() => {
      localStorage.setItem('mpm_attrib_current_tab', tabIndex.toString());
      if (tabIndex === 999) {
        this.displayedColumns = [];
        this.dataSource = new MatTableDataSource<object>();
      } else {
        this.generateTable(tabIndex);
      }
    });
    sessionStorage.setItem('mpm_showSelected', JSON.stringify(this.showSelected));
  }

  private getCurrentTab() {
    if (localStorage.getItem('mpm_attrib_current_tab') !== null) {
      return Number(localStorage.getItem('mpm_attrib_current_tab'));
    } else {
      return 0;
    }
  }

  showSelectedSwitch() {
    this.showSelected = !this.showSelected;
    sessionStorage.setItem('mpm_showSelected', JSON.stringify(this.showSelected));
    this.refreshTable();
  }

  public refreshTable() {
    const currentTab = this.getCurrentTab();
    setTimeout(() => {
      this.generateTable(currentTab);
    }, 0);
    if (sessionStorage.getItem('mpm_showSelected')) {
      this.showSelected = JSON.parse(sessionStorage.getItem('mpm_showSelected'));
    }
  }

  resetTable() {
    const rows = document.querySelectorAll('.selected-row');
    rows.forEach(row => row.classList.remove('selected-row'));
    this.selected_ents.clear();
  }

  selectRow(ent_id: string, event: Event) {
    const currentTab = this.getCurrentTab();
    if (currentTab === 9) {
      return;
    }
    const ent_type = ent_id.substr(0, 2);
    const id = Number(ent_id.substr(2));
    const target = event.target || event.srcElement || event.currentTarget;

    if (this.selected_ents.has(ent_id)) {
      this.attrTableSelect.emit({ action: 'unselect', ent_type: ent_type, id: id });
      this.selected_ents.delete(ent_id);
      // @ts-ignore
      target.parentNode.classList.remove('selected-row');
    } else {
      this.attrTableSelect.emit({ action: 'select', ent_type: ent_type, id: id });
      this.selected_ents.set(ent_id, id);
      // @ts-ignore
      target.parentNode.classList.add('selected-row');
    }

  }

}
