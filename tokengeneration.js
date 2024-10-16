// const { generateToken } = require("./utils/token");

// const testToken = () => {
//   try {
//     const token = generateToken("testId");
//     console.log("Generated Token:", token);
//   } catch (error) {
//     console.error("Error generating token:", error);
//   }
// };

// testToken();

const AdminController = require("./controllers/admin.controller");

// Test login to ensure token generation
const testLogin = async () => {
  try {
    const response = await fetch("http://localhost:5000/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
      }),
    });
    const data = await response.json();
    console.log("Login Response:", data);
  } catch (error) {
    console.error("Error:", error);
  }
};

testLogin();







<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><%= title %></title>
    <!-- <link rel="stylesheet" href="/styles.css"> -->
    <style>
        /* Basic styles for the modal */
        .modal {
            display: none; 
            position: fixed; 
            z-index: 1; 
            left: 0;
            top: 0;
            width: 100%; 
            height: 100%; 
            overflow: auto; 
            background-color: rgb(0,0,0); 
            background-color: rgba(0,0,0,0.4); 
            padding-top: 60px;
        }
        .modal-content {
            background-color: #fefefe;
            margin: 5% auto; 
            padding: 20px;
            border: 1px solid #888;
            width: 80%; 
        }
        .close {
            color: #aaa;
            float: right;
            font-size: 28px;
            font-weight: bold;
        }
        .close:hover,
        .close:focus {
            color: black;
            text-decoration: none;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <h1>Available Tables</h1>
    <table>
        <thead>
            <tr>
                <th>Table Number</th>
                <th>Seat Count</th>
                <th>Status</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody>
            <% tables.forEach(table => { %>
                <tr>
                    <td><%= table.tableNumber %></td>
                    <td><%= table.seatCount %></td>
                    <td><%= table.status %></td>
                    <td>
                         <button onclick="openModal('<%= table._id %>', '<%= table.tableNumber %>')">Book</button>
                    </td>
                </tr>
            <% }) %>
        </tbody>
    </table>

    <!-- Modal for Booking -->
    <div id="bookingModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeModal()">&times;</span>
            <h2 id="modalTitle"></h2>
            <p id="modalText"></p>

            <!-- Form for Marking as Waiting -->
            <form class="bookingForm" action="/waiter/tables/book" method="POST">
                <input type="hidden" name="tableId" id="tableIdBook">
                <button type="submit"> Wait</button>
            </form>
            <!-- Form for Marking as Waiting -->
            <form class="bookingForm" action="/waiter/tables/new" method="POST">
                <input type="hidden" name="tableId" id="tableIdNew">
                <button type="submit"> New</button>
            </form>

            <!-- Form for Marking as Served -->
            <form class="bookingForm" action="/waiter/tables/serveTable" method="POST">
                <input type="hidden" name="tableId" id="tableIdServe">
                <button type="submit">Served</button>
            </form>

            <!-- Form for Marking as Delivered -->
            <form class="bookingForm" action="/waiter/tables/deliverTable" method="POST">
                <input type="hidden" name="tableId" id="tableIdDeliver">
                <button type="submit"> Delivered</button>
            </form>
        </div>
    </div>

    <script>
        function openModal(tableId, tableNumber) {
            // Set the table ID for each form
            document.getElementById('tableIdBook').value = tableId;
            document.getElementById('tableIdNew').value = tableId;
            document.getElementById('tableIdServe').value = tableId;
            document.getElementById('tableIdDeliver').value = tableId;

            // Update modal title and text
            document.getElementById('modalTitle').innerText = 'Table: ' + tableNumber;
            document.getElementById('modalText').innerText = 'PLEASE MARK THE TABLE AS';
            document.getElementById('bookingModal').style.display = 'block';
        }

        function closeModal() {
            document.getElementById('bookingModal').style.display = 'none';
        }

        // Close the modal when clicking outside of it
        window.onclick = function(event) {
            if (event.target === document.getElementById('bookingModal')) {
                closeModal();
            }
        }
    </script>
</body>
</html>


 <form id="payment-form" action="/waiter/payment" method="POST">
    <input type="hidden" name="orderId" value="<%= orderId %>">
    <div id="card-element"><!-- A Stripe Element will be inserted here. --></div>
    <button type="submit" id="submit">Pay</button>
    <div id="payment-result"></div>
</form>

<script src="https://js.stripe.com/v3/"></script>
<script>
    const stripe = Stripe('your_stripe_public_key');
    const elements = stripe.elements();

    const cardElement = elements.create('card');
    cardElement.mount('#card-element');

    const form = document.getElementById('payment-form');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const { paymentMethod, error } = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
        });

        if (error) {
            document.getElementById('payment-result').innerText = error.message;
        } else {
            // Submit the form with the payment method ID
            const hiddenInput = document.createElement('input');
            hiddenInput.setAttribute('type', 'hidden');
            hiddenInput.setAttribute('name', 'paymentMethodId');
            hiddenInput.setAttribute('value', paymentMethod.id);
            form.appendChild(hiddenInput);
            form.submit();
        }
    });
</script>





<% if (order.status==='pending' ) { %>
    <form action="/waiter/orders/serve" method="POST" style="display:inline;">
        <input type="hidden" name="orderId" value="<%= order._id %>">
        <button type="submit">Mark as Served</button>
    </form>
    <% } else { %>
        <form action="/waiter/orders/updateStatus" method="POST" style="display:inline;">
            <input type="hidden" name="orderId" value="<%= order._id %>">
            <div class="switch">
                <input type="radio" id="pending-<%= order._id %>" name="status" value="pending"
                    <%=order.status==='pending' ? 'checked' : '' %> onchange="this.form.submit()">
                <label for="pending-<%= order._id %>">Pending</label>

                <input type="radio" id="preparing-<%= order._id %>" name="status" value="preparing"
                    <%=order.status==='preparing' ? 'checked' : '' %> onchange="this.form.submit()">
                <label for="preparing-<%= order._id %>">Preparing</label>

                <input type="radio" id="done-<%= order._id %>" name="status" value="done" <%=order.status==='done'
                    ? 'checked' : '' %> onchange="this.form.submit()">
                <label for="done-<%= order._id %>">Done</label>

                <input type="radio" id="delivered-<%= order._id %>" name="status" value="delivered"
                    <%=order.status==='delivered' ? 'checked' : '' %> onchange="this.form.submit()">
                <label for="delivered-<%= order._id %>">Delivered</label>
            </div>
        </form>
        <% } %></meta>