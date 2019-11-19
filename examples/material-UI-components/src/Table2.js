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

import { useTable, useSortBy, usePagination } from 'react-table'

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

const Table = ({ columns, data, loading, fetchData, title, controlledPageCount }) => {
  // Use the state and functions returned from useTable to build your UI

  const {
    getTableProps,
    getTableHeaderProps,
    headerGroups,
    rows,
    prepareRow,
    page,
    nextPage,
    canPreviousPage,
    canNextPage,
    previousPage,
    state
  } = useTable({
    columns,
    data,
    initialState: { pageIndex: 0, pageSize: 50 }, // Pass our hoisted table state
    manualPagination: true, // Tell the usePagination
    // hook that we'll handle our own data fetching
    // This means we'll also have to provide our own
    // pageCount.
    pageCount: controlledPageCount
  }, useSortBy, usePagination);

  const pageIndex = state[0].pageIndex;

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


  React.useEffect(() => {
    console.log(pageIndex);
    fetchData({ pageIndex });
  }, [fetchData, pageIndex]);
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
      <MaUTable {...getTableProps()} stickyHeader={true} size="small">
        <TableHead>
          {headerGroups.map(headerGroup => (
            <TableRow {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <TableCell {...column.getHeaderProps(column.getSortByToggleProps())}>
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
        <TableBody>
          {page.map(
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
              )}
          )}
        </TableBody>
      </MaUTable>
      { loading ? 'Loading...': ''}
      <div>
        <IconButton onClick={() => previousPage()} disabled={!canPreviousPage}>
          prev
        </IconButton>
        <IconButton onClick={() => nextPage()} disabled={!canNextPage}>
          next
        </IconButton>
      </div>
    </div>
  )
}

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
  
  const [data, setData ] = useState([]);
  const [cachedData, setCachedData] = useState(new Map());
  const [ count, setCount ] = useState(0);
  const [ pageCount, setPageCount ] = useState(50);
  const [ loading, setLoading ] = useState(false);
  const fetchData = useCallback(({ pageIndex }) => {
    if(cachedData.has(pageIndex)){ 
      setData(cachedData.get(pageIndex));
    } else {
      setLoading(true);
      setTimeout(() => {
        const makeupData = makeData(Math.random()*10);
        setData(makeupData);
        setCachedData(cachedData.set(pageIndex, makeupData));
        setCount(count + 1);
        setLoading(false);
      }, 1500);
    }
  }, []);
  return (
    <div>
      <CssBaseline />
      <Table columns={columns} data={data} title={'Class/Event'} fetchData={fetchData} loading={loading} controlledPageCount={pageCount}/>
    </div>
  )
}

export default App
