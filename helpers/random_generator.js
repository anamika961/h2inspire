const express = require("express");
const Tickets = require("../models/tickets");

export async function randomTicketNumber() {
  var result = "";
  var chars1 = "23456789";
  var chars2 = "0123456789";
  for (var i = 6; i > 0; --i) {
    result += chars1[Math.floor(Math.random() * chars1.length)];
  }
  for (var i = 2; i > 0; --i) {
    result += chars2[Math.floor(Math.random() * chars2.length)];
  }
  var checkTicketNum = await Tickets.findOne({uniqueId: result});
  if (checkTicketNum) {
    return randomTicketNumber();
  }
  return result;
}