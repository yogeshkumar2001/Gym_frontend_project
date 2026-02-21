import React from 'react';
import { DatePicker } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { setDateRange } from '../../features/filters/filterSlice';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const DateRangePicker = () => {
  const dispatch = useDispatch();
  const { startDate, endDate } = useSelector((state) => state.filters);

  const value =
    startDate && endDate ? [dayjs(startDate), dayjs(endDate)] : null;

  const handleChange = (dates) => {
    dispatch(
      setDateRange({
        startDate: dates ? dates[0].startOf('day').toISOString() : null,
        endDate: dates ? dates[1].endOf('day').toISOString() : null,
      })
    );
  };

  return (
    <RangePicker
      value={value}
      onChange={handleChange}
      style={{ width: '100%' }}
      placeholder={['Start Date', 'End Date']}
      format="MMM DD, YYYY"
      allowClear
    />
  );
};

export default DateRangePicker;
