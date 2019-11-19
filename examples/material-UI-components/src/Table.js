import React, { useCallback, useState } from 'react'
import CssBaseline from '@material-ui/core/CssBaseline'
import { lighten, makeStyles } from '@material-ui/core/styles';
import MaUTable from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableSortLabel from '@material-ui/core/TableSortLabel'
import TableRow from '@material-ui/core/TableRow'
import TablePagination from '@material-ui/core/TablePagination';
import GetAppIcon from '@material-ui/icons/GetApp';
import SearchIcon from '@material-ui/icons/Search';
import FilterListIcon from '@material-ui/icons/FilterList';
import Tooltip from '@material-ui/core/Tooltip';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import XLSX from 'xlsx';
import { FixedSizeList } from 'react-window'
import { InfiniteLoader } from 'react-window-infinite-loader';

import { useTable, useSortBy, useBlockLayout } from 'react-table'

import makeData from './makeData';

const useToolbarStyles = makeStyles(theme => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
  },
  title: {
    flex: '1 1 100%',
  },
}));

const Table = ({ columns, data, loading, fetchData, title, hasMore }) => {
  // Use the state and functions returned from useTable to build your UI

  const defaultColumn = React.useMemo(
    () => ({
      width: 150,
    }),
    []
  )
  const {
    getTableProps,
    getTableHeaderProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    totalColumnsWidth
  } = useTable({
    columns,
    data,
    defaultColumn
  }, useSortBy, useBlockLayout)

  const classes = useToolbarStyles();

  const downloadExcel = useCallback(() => {
    const textData = data.map(d => {
      return columns.map(col => col.getText(d))
    });
    const header = columns.map(col => col.Header);
    const worksheet = XLSX.utils.aoa_to_sheet([header, ...textData]);
    const newWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(newWorkbook, worksheet, 'SheetJS');
    XLSX.writeFile(newWorkbook, `GM_TABLE_${title}_EXPORT.xlsx`);
  }, [data, columns]);

  const RenderRow = React.useCallback(
    ({ index, style }) => {
      const row = rows[index]
      prepareRow(row)
      return (
        <div
          {...row.getRowProps({
            style,
          })}
          className="tr"
        >
          {row.cells.map(cell => {
            return (
              <div {...cell.getCellProps()} className="td">
                <TableCell {...cell.getCellProps()} component="div">
                  {cell.render('Cell')}
                </TableCell>
              </div>
            )
          })}
        </div>
      )
    },
    [prepareRow, rows]
  )
  // Render the UI for your table
  return (
    <div>
      <Toolbar className={classes.root}>
        <Typography variant="h6" className={classes.title}>
          { title }
        </Typography>
        {/* TODO: Later */}
        {/* <Tooltip title="Search">
          <IconButton aria-label="Search">
            <SearchIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Filter">
          <IconButton aria-label="Filter">
            <FilterListIcon />
          </IconButton>
        </Tooltip> */}
        <Tooltip title="Download Excel">
          <IconButton aria-label="Download Excel" onClick={downloadExcel}>
            <GetAppIcon />
          </IconButton>
        </Tooltip>
      </Toolbar>
      <MaUTable {...getTableProps()} stickyHeader={true} size="small" component="div">
        <TableHead component="div">
          {headerGroups.map(headerGroup => (
            <TableRow {...headerGroup.getHeaderGroupProps()} component="div">
              {headerGroup.headers.map(column => (
                <TableCell {...column.getHeaderProps(column.getSortByToggleProps())} component="div">
                  <TableSortLabel
                    active={column.isSorted}
                    direction={column.isSortedDesc ? 'desc' : 'asc'}
                  >
                    {column.render('Header')}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <div {...getTableBodyProps()}>
          <FixedSizeList
            height={400}
            itemCount={rows.length}
            itemSize={35}
            width={totalColumnsWidth}
          >
            {RenderRow}
          </FixedSizeList>
        </div>
        {/* <TableBody>
          <InfiniteScroll
            dataLength={data.length} //This is important field to render the next data
            next={fetchData}
            hasMore={hasMore}
            loader={<h4>Loading...</h4>}
          >
            {rows.map(
              (row, i) => {
                prepareRow(row);
                return (
                  <TableRow {...row.getRowProps()}>
                    {row.cells.map(cell => {
                      return (
                        <TableCell {...cell.getCellProps()}>
                          {cell.render('Cell')}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              }
            )}
          </InfiniteScroll>
        </TableBody> */}
      </MaUTable>
    </div>
  )
}

const initialData = makeData(220);
function App() {
  const columns = React.useMemo(
    () => [
      {
        Header: 'First Name',
        accessor: 'firstName',
        getText: d => d.firstName
      },
      {
        Header: 'Last Name',
        accessor: 'lastName',
        getText: d => d.lastName
      },
      {
        Header: 'Age',
        accessor: 'age',
        getText: d => d.age
      },
      {
        Header: 'Visits',
        accessor: 'visits',
        getText: d => d.visits
      },
      {
        Header: 'Status',
        accessor: 'status',
        getText: d => d.status
      },
      {
        Header: 'Profile Progress',
        accessor: 'progress',
        getText: d => d.progress
      },
    ],
    []
  )
  
  const [data, setData ] = useState(initialData);
  const [ count, setCount ] = useState(0);
  const [ hasMore, setHasMore ] = useState(true);
  const fetchData = () => {
    if(count === 3){
      setHasMore(false);
    } else {
      setTimeout(() => {
        setData([...data, ...makeData(100)]);
        setCount(count + 1);
      }, 1500);
    }
  }
  return (
    <div>
      <CssBaseline />
      <Table columns={columns} data={data} hasMore={hasMore} title={'Class/Event'} fetchData={fetchData}/>
    </div>
  )
}

export default App
