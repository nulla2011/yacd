import cx from 'clsx';
import { formatDistance } from 'date-fns';
import React from 'react';
import { ChevronDown } from 'react-feather';
import { useSortBy, useTable } from 'react-table';

import prettyBytes from '../misc/pretty-bytes';
import s from './ConnectionTable.module.scss';
import { MutableConnRefCtx } from './conns/ConnCtx';

const sortDescFirst = true;

const fullColumns = [
  { accessor: 'id', show: false },
  { Header: 'Action', accseeor: 'action' },
  { Header: 'Host', accessor: 'host' },
  { Header: 'Process', accessor: 'process' },
  { Header: 'DL', accessor: 'download', sortDescFirst },
  { Header: 'UL', accessor: 'upload', sortDescFirst },
  { Header: 'DL Speed', accessor: 'downloadSpeedCurr', sortDescFirst },
  { Header: 'UL Speed', accessor: 'uploadSpeedCurr', sortDescFirst },
  { Header: 'Chains', accessor: 'chains' },
  { Header: 'Rule', accessor: 'rule' },
  { Header: 'Time', accessor: 'start', sortDescFirst },
  { Header: 'Source', accessor: 'source' },
  { Header: 'Destination IP', accessor: 'destinationIP' },
  { Header: 'Type', accessor: 'type' },
];

const columns = fullColumns;
const columnsWithoutProcess = fullColumns.filter((item) => item.accessor !== 'process');

function renderCell(cell: { column: { id: string }; value: number }) {
  switch (cell.column.id) {
    case 'start':
      return formatDistance(cell.value, 0);
    case 'download':
    case 'upload':
      return prettyBytes(cell.value);
    case 'downloadSpeedCurr':
    case 'uploadSpeedCurr':
      return prettyBytes(cell.value) + '/s';
    case 'Action':
      return '❌';
    default:
      return cell.value;
  }
}

const sortById = { id: 'id', desc: true };
const tableState = {
  sortBy: [
    // maintain a more stable order
    sortById,
  ],
  hiddenColumns: ['id'],
};

function Table({ data }) {
  const connCtx = React.useContext(MutableConnRefCtx);
  const { getTableProps, headerGroups, rows, prepareRow } = useTable(
    {
      columns: connCtx.hasProcessPath ? columns : columnsWithoutProcess,
      data,
      initialState: tableState,
      autoResetSortBy: false,
    },
    useSortBy
  );
  return (
    <div
      {...getTableProps()}
      style={{
        // @ts-ignore
        '--col-count': connCtx.hasProcessPath ? '13' : '12',
      }}
    >
      {headerGroups.map((headerGroup) => {
        return (
          <div {...headerGroup.getHeaderGroupProps()} className={s.tr}>
            {headerGroup.headers.map((column) => (
              <div {...column.getHeaderProps(column.getSortByToggleProps())} className={s.th}>
                <span>{column.render('Header')}</span>
                <span className={s.sortIconContainer}>
                  {column.isSorted ? (
                    <span className={column.isSortedDesc ? '' : s.rotate180}>
                      <ChevronDown size={16} />
                    </span>
                  ) : null}
                </span>
              </div>
            ))}

            {rows.map((row, i) => {
              prepareRow(row);
              return row.cells.map((cell, j) => {
                return (
                  <div
                    {...cell.getCellProps()}
                    className={cx(
                      s.td,
                      i % 2 === 0 ? s.odd : false,
                      connCtx.hasProcessPath
                        ? j >= 2 && j <= 5
                          ? s.du
                          : false
                        : j >= 1 && j <= 4
                        ? s.du
                        : false
                    )}
                  >
                    {renderCell(cell)}
                  </div>
                );
              });
            })}
          </div>
        );
      })}
    </div>
  );
}

export default Table;
