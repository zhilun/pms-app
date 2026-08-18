// src/services/bookingService.js
import { supabase } from './supabase';

export const getBookings = async () => {
  const { data } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
  if (!data) return [];

  return data.map(b => ({
    id: b.id,
    createdDate: b.created_at?.split('T')[0],
    salesPerson: b.sales_person,
    customerName: b.customer_name,
    roomCode: b.room_code,
    bedrooms: b.bedrooms,
    checkInDate: b.check_in_date,
    checkOutDate: b.check_out_date,
    roomPrice: b.room_price,
    serviceFee: b.service_fee,
    totalPrice: b.total_price,
    deposit: b.deposit,
    remainingPrice: b.remaining_price,
    confirmationCode: b.confirmation_code,
    status: b.status,
    updatedAt: b.updated_at
  }));
};

export const createBooking = async (b, userId) => {
  return await supabase.from('bookings').insert([{
    sales_person: b.salesPerson,
    customer_name: b.customerName,
    room_code: b.roomCode,
    bedrooms: b.bedrooms,
    check_in_date: b.checkInDate,
    check_out_date: b.checkOutDate,
    room_price: b.roomPrice,
    service_fee: b.serviceFee,
    total_price: b.totalPrice,
    deposit: b.deposit,
    remaining_price: b.remainingPrice,
    confirmation_code: b.confirmationCode,
    status: b.status,
    user_id: userId
  }]);
};

export const approveBooking = async (id, code) => {
  return await supabase.from('bookings').update({ confirmation_code: code, status: 'CONFIRMED' }).eq('id', id);
};

export const updateBooking = async (id, b) => {
  return await supabase.from('bookings').update({
    sales_person: b.salesPerson,
    customer_name: b.customerName,
    room_code: b.roomCode,
    bedrooms: b.bedrooms,
    check_in_date: b.checkInDate,
    check_out_date: b.checkOutDate,
    room_price: b.roomPrice,
    service_fee: b.serviceFee,
    total_price: b.totalPrice,
    deposit: b.deposit,
    remaining_price: b.remainingPrice,
    confirmation_code: b.confirmationCode,
    status: b.status
  }).eq('id', id);
};

export const getSalesPersons = async () => {
  const { data } = await supabase.from('sales_persons').select('*');
  return data || [];
};

export const createSalesPerson = async (name, company) => {
  return await supabase.from('sales_persons').insert([{ name, company }]);
};

export const updateSalesPerson = async (id, name, company) => {
  return await supabase.from('sales_persons').update({ name, company }).eq('id', id);
};

export const deleteSalesPerson = async (id) => {
  return await supabase.from('sales_persons').delete().eq('id', id);
};