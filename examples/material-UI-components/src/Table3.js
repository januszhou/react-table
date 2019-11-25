import React, { useState, useEffect, useCallback, useMemo } from 'react'

import CssBaseline from '@material-ui/core/CssBaseline';
import { makeStyles } from '@material-ui/core/styles';
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
import Input from '@material-ui/core/Input';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import XLSX from 'xlsx';

import { useTable, useSortBy, usePagination } from 'react-table';

import makeData from './makeData';

const useToolbarStyles = makeStyles(theme => ({
  root: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
  title: {
    flex: '1 1 100%',
  },
}));



const useDownload = ({ download, data, columns, title }) => {
  const onClick = useCallback(() => {
    const textData = data.map(d => {
      return columns.map(c => {
        const getText = c.getText || c.accessor;
        return getText(d);
      });
    });
    const header = columns.map(col => col.Header);
    const worksheet = XLSX.utils.aoa_to_sheet([header, ...textData]);
    const newWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(newWorkbook, worksheet, 'SheetJS');
    XLSX.writeFile(newWorkbook, `${title}_EXPORT.xlsx`);
  }, [ data, columns, title ])

  const downloadButton = useMemo(() => (
    <Tooltip title="Download Excel">
      <IconButton aria-label="Download Excel" onClick={onClick}>
        <GetAppIcon />
      </IconButton>
    </Tooltip>
  ), [ onClick ]);

  return { downloadButton };
}

const useFilterColumn = ({ columns }) => {
  const [ filteredColumn, setFilteredColumn ] = useState(columns);
  const [ open, setOpen ] = useState(false);
  const onChange = (event) => {
    const checked = event.target.checked;
    const name = event.target.value;
    const columnIndex = columns.indexOf(c => c.Header === name);
    const column = filteredColumn[columnIndex];
    
  }

  // const MenuProps = {
  //   PaperProps: {
  //     style: {
  //       maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
  //       width: 250,
  //     },
  //   },
  // };

  const onClick = () => setOpen(!open);

  const filterButton = useMemo(() => {
    return (
      <>
        <Tooltip title="Filter Column">
          <IconButton aria-label="Filter Column" onClick={onClick}>
            <FilterListIcon />
          </IconButton>
        </Tooltip>
        <Menu open={open}>
          {filteredColumn.map((column) => (
            <MenuItem key={column.Header} value={column.Header}>
              <Checkbox checked={column.show !== false} onChange={onChange} value={column.Header}/>
              <ListItemText primary={column.Header} />
            </MenuItem>
          ))}
        </Menu>
      </>
    )
  })
}

export const MaterialTable = (props) => {
  const { columns, data, rowsPerPage = 5, title, dense = true, download = true } = props;

  const classes = useToolbarStyles()

  const {
    getTableProps,
    headerGroups,
    prepareRow,
    gotoPage,
    page,
    state,
    setPageSize
  } = useTable({
    columns,
    data,
    initialState: { pageIndex: 0 },
  }, useSortBy, usePagination);

  const { pageIndex, pageSize } = state[0];

  const emptyRows = pageSize - Math.min(pageSize, data.length - pageIndex * pageSize);
  
  useEffect(() => {
    setPageSize(rowsPerPage);
  }, [rowsPerPage, setPageSize]);

  
  const { downloadButton } = useDownload({ data, columns, title });
  
  return (
    <>
      <Toolbar className={classes.root}>
        <Typography variant="h6" className={classes.title}>
          {title}
        </Typography>
        { download && downloadButton }
      </Toolbar>
      <MaUTable {...getTableProps()} stickyHeader={true} size={dense ? 'small' : 'medium'}>
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
            (row) => {
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
          {emptyRows > 0 && (
            <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
              <TableCell colSpan={columns.length} />
            </TableRow>
          )}
        </TableBody>
      </MaUTable>
      <TablePagination
        component="div"
        rowsPerPageOptions={[]}
        count={data.length}
        rowsPerPage={pageSize}
        page={pageIndex}
        backIconButtonProps={{
          'aria-label': 'previous page',
        }}
        nextIconButtonProps={{
          'aria-label': 'next page',
        }}
        onChangePage={(event, currPage) => { gotoPage(currPage); }}
      />
    </>
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
  
  const data = React.useMemo(() => makeData(91), [])
  return (
    <div>
      <CssBaseline />
      <MaterialTable columns={columns} data={data} title={'Class/Event'} download={true}/>
    </div>
  )
}

export default App