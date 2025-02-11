import React from 'react'

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

import { useTable, useSortBy } from 'react-table'

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

function Table({ columns, data, loading, fetchData }) {
  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableHeaderProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({
    columns,
    data
  }, useSortBy)

  const handleChangePage = (event, newPage) => {
    console.log("now page", newPage);
    // gotoPage(newPage);
  }

  const classes = useToolbarStyles();
  // Render the UI for your table
  return (
    <div>
      <Toolbar className={classes.root}>
        <Typography variant="h6" className={classes.title}>
          Class/Event
        </Typography>
        <Tooltip title="Search">
          <IconButton aria-label="Search">
            <SearchIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Filter">
          <IconButton aria-label="Filter">
            <FilterListIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Download">
          <IconButton aria-label="Download">
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
                    onClick={(e) => console.log(e)}
                  >
                    {column.render('Header')}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody>
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
        </TableBody>
      </MaUTable>
    </div>
  )
}

function App() {
  const columns = React.useMemo(
    () => [
      {
        Header: 'First Name',
        accessor: 'firstName',
      },
      {
        Header: 'Last Name',
        accessor: 'lastName',
      },
      {
        Header: 'Age',
        accessor: 'age',
      },
      {
        Header: 'Visits',
        accessor: 'visits',
      },
      {
        Header: 'Status',
        accessor: 'status',
      },
      {
        Header: 'Profile Progress',
        accessor: 'progress',
      },
    ],
    []
  )

  const data = React.useMemo(() => makeData(20), [])

  return (
    <div>
      <CssBaseline />
      <Table columns={columns} data={data} />
    </div>
  )
}

export default App
