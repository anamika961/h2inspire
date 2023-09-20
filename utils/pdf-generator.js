const fs = require("fs");
const PDFDocument = require("pdfkit");

    // generateHeader(doc);
    // generateCustomerInformation(doc, invoice);
    // generateInvoiceTable(doc, invoice);
    // generateFooter(doc);

function generateInvoicePdf(invoice, path) {
   
    let doc = new PDFDocument({ size: "A4", margin: 50 });


    doc.fontSize(16).text('Invoice', { align: 'center' });

    doc.moveDown(1); // Move down one line before adding the subject

    const subjectText = 'Payment for ' + invoice.packaeName;
    const textWidth = doc.widthOfString(subjectText);
    const textX = (doc.page.width - textWidth) / 2; // Center the text horizontally
    const textY = doc.y; // Get the current Y position
    doc.text(subjectText, textX, textY);

    const underlineY = textY + doc.currentLineHeight() + 5; // Adjust the value to control the underline position
    doc.lineWidth(1).moveTo(textX, underlineY).lineTo(textX + textWidth, underlineY).stroke();

    doc.fontSize(12).text('Date: ' + invoice.subDate, 50, doc.y + 20);
    doc.fontSize(12).text('Invoice No: ' + invoice.invoiceNo , 380, doc.y);


    // Add the billing address
    const billingAddress = `Your Billing Address Here\nEmail: ${invoice.empEmail}\nPhone No: ${invoice.empPhoneNo}`;
    doc.fontSize(12).text('Billing Address:', 50, doc.y + 20);
    doc.font('Helvetica').fontSize(10).text(billingAddress, 50, doc.y + 5, {
        width: doc.page.width - 100, // Limit the width to keep text within the page
        align: 'left',
    });

    const tableHeader = ['Description', 'Amount'];
    const tableX = 50;
    const tableY = doc.y + 20; // Position below the billing address
    const columnWidth = (doc.page.width - 100) / tableHeader.length; // Divide available width evenly
    
    

    doc.fontSize(12);
    doc.text(tableHeader[0], tableX, tableY);
    const amountColumnX = doc.page.width - columnWidth - 50; // Place the "Amount" column on the right side
    doc.text(tableHeader[1], amountColumnX + 180, tableY);

    doc.lineWidth(1).moveTo(tableX, tableY + 15).lineTo(tableX + doc.page.width - 100, tableY + 15).stroke();

    // Add table data (one row)
    const tableData = [invoice.packaeName, invoice.amount];
    doc.text(tableData[0], tableX, doc.y + 20);
    doc.text(tableData[1], tableX + columnWidth + 180, doc.y - 15);

    const gstAmount = "18%"; // Replace with your GST amount
    const totalAmount = invoice.totalAmount; // Replace with your total amount
    doc.text(`GST: ${gstAmount}`, amountColumnX + 150, doc.y + 20);
    doc.text(`Total: ${totalAmount}`, amountColumnX + 150, doc.y + 5);

    const footerText = 'Your Footer Text Here';
    doc.fontSize(10).text(footerText, doc.page.margins.left + 200, doc.page.height - 100);




    // Add the invoice number on the right side with a font size of 12px
    // const invoiceNumber = 'Your Invoice Number Here';
    // const invoiceNumberWidth = doc.widthOfString(invoiceNumber);
    // const invoiceNumberX = doc.page.width - invoiceNumberWidth - 50;
    // doc.text('Invoice Number: ' + invoiceNumber, invoiceNumberX, doc.y);

    
    

    doc.end();
    doc.pipe(fs.createWriteStream(path));
}

function generateHeader(doc) {
//     doc
//         //.image("uploads/logo.png", 50, 45, { width: 50 })
//         .fillColor("#444444")
//         .fontSize(20)
//         .text("Hire2Inspire", 110, 57)
//         .fontSize(10)
//         .text("Kolkata 700001", 200, 65, { align: "right" })
//         .text("India", 200, 80, { align: "right" })
//         .moveDown();
// }


// const PDFDocument = require('pdfkit');
// const fs = require('fs');

// Create a new PDF document
// const doc = new PDFDocument();
let invoiceData ={};
const ChnageFormatDate = (d) =>{
    return d;
}
const DueDate = (d) =>{
   return d ;
}
let EmpData = {} ;
const GSTIN = (d) =>{
    return d;
}
// Pipe the PDF content to a writable stream (e.g., a file)
const outputStream = fs.createWriteStream('invoice.pdf');
doc.pipe(outputStream);

// Set up your fonts and other styling here
doc.font('Helvetica');
doc.fontSize(11);

// Add Logo
// doc.image('uploads/logo.png', 50, 45, { width: 50 });

// Title
doc.fillColor("#444444").fontSize(20).text('TAX INVOICE', 110, 57);

// Company Address
doc.fontSize(10).text('Kolkata 700001', 200, 65, { align: 'right' });
doc.text('India', 200, 80, { align: 'right' });

// Billing Address
const billingAddress = [
    'Hire2Inspire',
    'Bangalore',
    'Phone: 9876456789',
    'Email: info@hire2inspire.com'
];
doc.text(billingAddress.join('\n'), 50, 120);

// Invoice Number and Dates
doc.text(`Invoice Number: ${invoiceData?.invoice_No}`, 400, 120, { align: 'right' });
doc.text(`Invoice Date: ${ChnageFormatDate(new Date(invoiceData?.billing_id?.createdAt))}`, 400, 135, { align: 'right' });
doc.text(`Due Date: ${DueDate(invoiceData?.billing_id?.createdAt)}`, 400, 150, { align: 'right' });

//Client Address
const clientAddress = [
    'Invoice Issued For-',
    `Name: ${EmpData?.fname} ${EmpData?.lname}`,
    `Company: ${invoiceData?.billing_id?.hire_id?.comp_name.toUpperCase()}`,
    `Address: ${invoiceData?.billing_id?.address?.substring(0, 30)}`,
    `Phone: ${EmpData?.mobile}`,
    `Email: ${invoiceData?.billing_id?.email}`,
    `${EmpData?.company_website_url}`
];
doc.text(clientAddress.join('\n'), 50, 190);

GSTIN
const gstinText = `GSTIN: ${invoiceData?.gst_in}`;
doc.fontSize(8).text(gstinText, 50, 320);

// Subject Line
const subjectLine = 'Subject: Invoice from Hire2Inspire for Hiring Candidate.';
doc.fontSize(10).text(subjectLine, 50, 350);

//Candidate Billing Address
const candidateBillingAddress = [
    'Candidate Information:',
    // `Name: ${invoiceData?.candidate?.fname} ${invoiceData?.candidate?.lname}`,
    // `Date of Joining: ${ChnageFormatDate(new Date(invoiceData?.billing_id?.hire_id?.date_of_joining))}`,
    // `Designation offered: ${invoiceData?.billing_id?.hire_id?.desg_offered}`,
    // `CTC offered : ${invoiceData?.billing_id?.hire_id?.comp_offered}`,
    // `Company Name: ${invoiceData?.billing_id?.hire_id?.comp_name}`
];
doc.fontSize(9);
for (let i = 0; i < candidateBillingAddress.length; i++) {
    const line = candidateBillingAddress[i];
    doc.text(line, 50, 380 + i * 20);
}


// Finalize the PDF document


// // Calculate total GST and other amounts
// const totalAmount = invoiceData?.split_amount?.h2i_amount + invoiceData?.split_amount?.agency_amount;
// const gstPercentage = 18;
// const gstAmount = totalAmount * (gstPercentage / 100);

// // Display total amount and GST
// doc.fillColor('#0C356A').fontSize(10).text(`Total Amount: ${totalAmount.toFixed(2)} rupees`, 400, tableY + 20, { align: 'right' });
// doc.text(`GST (${gstPercentage}%): ${gstAmount.toFixed(2)} rupees`, 400, tableY + 40, { align: 'right' });

// // Display final amount
// doc.font('Helvetica-Bold').text(`Final Amount: ${invoiceData?.amount.toFixed(2)} rupees`, 400, tableY + 60, { align: 'right' });

// // Add Logo at the bottom right corner
// doc.image('uploads/h2iSign.png', 350, 700, { width: 100 });

// // Add company name and authorized signature
// doc.fontSize(10).text('For Sant Sales India Pvt Ltd', 50, 700);
// doc.fontSize(10).text('Authorized Signature', 50, 720);

// // Finalize the PDF document
// doc.end();

// console.log('PDF generated successfully.');
}


// function generateCustomerInformation(doc, invoice) {
//     doc
//         .fillColor("#444444")
//         .fontSize(20)
//         .text("Invoice", 50, 160);

//     generateHr(doc, 185);

//     const customerInformationTop = 200;

//     doc
//         .fontSize(10)
//         .text("Invoice no:", 50, customerInformationTop)
//         .font("Helvetica-Bold")
//         .text(invoice.orderNo, 150, customerInformationTop)
//         .font("Helvetica")
//         .text("Invoice Date:", 50, customerInformationTop + 15)
//         .text(formatDate(new Date()), 150, customerInformationTop + 15)
//         .text("Invoice Amount:", 50, customerInformationTop + 30)
//         .text(
//             formatCurrency(invoice.orderPrice),
//             150,
//             customerInformationTop + 30
//         )

//         // .font("Helvetica-Bold")
//         // .text(invoice.supplierData.name, 300, customerInformationTop)
//         // .font("Helvetica")
//         // .text(invoice.supplierData.address, 300, customerInformationTop + 15)
//         // .text(
//         //     invoice.supplierData.city +
//         //     ", " +
//         //     invoice.supplierData.country +
//         //     ", " +
//         //     invoice.supplierData.pincode,
//         //     300,
//         //     customerInformationTop + 30
//         // )
//         // .moveDown();

//     generateHr(doc, 252);
// }

function generateInvoiceTable(doc, invoice) {
    let i;
    const invoiceTableTop = 330;
    // const { client } = invoice;
    // const { pricePerSession } = client;

    doc.font("Helvetica-Bold");
    generateTableRow(
        doc,
        invoiceTableTop,
        "Item"
    );
    generateHr(doc, invoiceTableTop + 20);
    doc.font("Helvetica");

    // for (i = 0; i < invoice.orderDetailsArray.length; i++) {
    //     const item = invoice.orderDetailsArray[i];
    //     const position = invoiceTableTop + (i + 1) * 30;
    //     generateTableRow(
    //         doc,
    //         position,
    //         item.proTitle,
    //         formatCurrency(item.main_price),
    //         formatCurrency(item.price),
    //         item.quantity,
    //         formatCurrency(item.totalPrice)
    //     );

    //     generateHr(doc, position + 20);
    // }

    // const subtotalPosition = invoiceTableTop + (i + 1) * 30;
    // generateTableRow(
    //     doc.font("Helvetica-Bold"),
    //     subtotalPosition,
    //     "",
    //     "",
    //     "Subtotal",
    //     "",
    //     formatCurrency(invoice.orderPrice)
    // );

    
}



function generateTableRow(
    doc,
    y,
    item,
    mainCost,
    finalCost,
    quantity,
    total
) {
    doc
        .fontSize(10)
        .text(item, 50, y, { width: 120 })
        .text(mainCost, 180, y, { width: 90, align: "right" })
        .text(finalCost, 250, y, { width: 110, align: "right" })
        .text(quantity, 370, y, { width: 90, align: "right" })
        .text(total, 0, y, { align: "right" });
}

function generateHr(doc, y) {
    doc
        .strokeColor("#aaaaaa")
        .lineWidth(1)
        .moveTo(50, y)
        .lineTo(550, y)
        .stroke();
}

function formatCurrency(val) {
    return `Rs. ${val}`;
}

function formatDate(date) {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return day + " / " + month + " / " + year;
    // return date.toLocaleDateString()
}

module.exports = {
    generateInvoicePdf
};
