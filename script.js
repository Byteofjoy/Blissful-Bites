// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
});

// Smooth Scrolling for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Order Form Handling
const orderForm = document.getElementById('orderForm');
const deliveryAddress = document.querySelector('.delivery-address');
const quantityInput = document.getElementById('quantityInput');
const weightInput = document.getElementById('weightInput');
const itemSelect = document.getElementById('itemSelect');
const selectedItem = document.getElementById('selectedItem');
const selectedQuantity = document.getElementById('selectedQuantity');
const totalPrice = document.getElementById('totalPrice');

// Item prices in Ksh
const itemPrices = {
    cupcake: 150,
    cake: 1200, // per kg
    cookie: 80,
    bread: 700, // per kg
    bun: 100,
    croissant: 120,
    meatpie: 200,
    muffin: 130
};

// Toggle between quantity and weight input based on selected item
itemSelect.addEventListener('change', function() {
    const selectedItemValue = this.value;
    if (selectedItemValue === 'cake' || selectedItemValue === 'bread') {
        quantityInput.style.display = 'none';
        weightInput.style.display = 'block';
    } else {
        quantityInput.style.display = 'block';
        weightInput.style.display = 'none';
    }
    updateOrderSummary();
});

// Update order summary when inputs change
function updateOrderSummary() {
    const selectedValue = itemSelect.value;
    const quantity = document.querySelector('input[placeholder="Quantity"]').value;
    const weight = document.querySelector('input[placeholder="Weight in kg"]').value;
    
    if (selectedValue) {
        selectedItem.textContent = itemSelect.options[itemSelect.selectedIndex].text;
        
        let total = 0;
        if (selectedValue === 'cake' || selectedValue === 'bread') {
            if (weight) {
                total = parseFloat(weight) * itemPrices[selectedValue];
                selectedQuantity.textContent = `${weight} kg`;
            }
        } else {
            if (quantity) {
                total = parseInt(quantity) * itemPrices[selectedValue];
                selectedQuantity.textContent = `${quantity} pieces`;
            }
        }
        
        // Calculate initial payment (20% discount)
        const initialPayment = total * 0.8;
        const balancePayment = total - initialPayment;
        
        totalPrice.textContent = `Ksh ${total.toFixed(2)}`;
        document.getElementById('initialPayment').textContent = `Ksh ${initialPayment.toFixed(2)}`;
        document.getElementById('balancePayment').textContent = `Ksh ${balancePayment.toFixed(2)}`;
    }
}

// Update summary when quantity/weight changes
quantityInput.querySelector('input').addEventListener('input', updateOrderSummary);
weightInput.querySelector('input').addEventListener('input', updateOrderSummary);

// Validate order date and time
const orderDate = document.getElementById('orderDate');
const orderTime = document.getElementById('orderTime');

orderDate.addEventListener('change', function() {
    const selectedDate = new Date(this.value);
    const currentDate = new Date();
    
    // Ensure order date is not in the past
    if (selectedDate < currentDate) {
        alert('Please select a future date for your order.');
        this.value = '';
    }
});

// Handle order submission
orderForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const formObject = {};
    formData.forEach((value, key) => {
        formObject[key] = value;
    });

    const item = itemSelect.value;
    const quantity = document.querySelector('input[placeholder="Quantity"]').value;
    const weight = document.querySelector('input[placeholder="Weight in kg"]').value;
    const location = document.getElementById('location').value;
    const orderDate = document.getElementById('orderDate').value;
    const orderTime = document.getElementById('orderTime').value;
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    
    // Calculate prices
    let total = 0;
    if (item === 'cake' || item === 'bread') {
        total = parseFloat(weight) * itemPrices[item];
    } else {
        total = parseInt(quantity) * itemPrices[item];
    }
    
    const initialPayment = total * 0.8;
    const balancePayment = total - initialPayment;
    
    // Create order summary
    let orderSummary = `Thank you for your order!\n\n`;
    orderSummary += `Item: ${itemSelect.options[itemSelect.selectedIndex].text}\n`;
    orderSummary += item === 'cake' || item === 'bread' 
        ? `Weight: ${weight} kg\n`
        : `Quantity: ${quantity} pieces\n`;
    orderSummary += `Location: ${location}\n`;
    orderSummary += `Expected Date: ${orderDate} ${orderTime}\n`;
    orderSummary += `Payment Method: ${paymentMethod}\n`;
    orderSummary += `Initial Payment (20% discount): Ksh ${initialPayment.toFixed(2)}\n`;
    orderSummary += `Balance Payment: Ksh ${balancePayment.toFixed(2)}\n`;
    orderSummary += `\nWe will contact you soon to confirm the details.`;

    // Send order to backend
    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...formObject,
                item,
                quantity: item === 'cake' || item === 'bread' ? weight : quantity,
                location,
                orderDate,
                orderTime,
                paymentMethod,
                total,
                initialPayment,
                balancePayment,
                status: 'pending',
                createdAt: new Date().toISOString()
            })
        });

        if (response.ok) {
            alert(orderSummary);
            this.reset();
            itemSelect.value = '';
            document.querySelector('input[placeholder="Quantity"]').value = '';
            document.querySelector('input[placeholder="Weight in kg"]').value = '';
            document.getElementById('orderDate').value = '';
            document.getElementById('orderTime').value = '';
            document.getElementById('location').value = '';
        } else {
            alert('Failed to place order. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error placing order. Please try again later.');
    }
});

// Toggle delivery address visibility
const deliveryRadios = document.querySelectorAll('input[name="delivery"]');
deliveryRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        if (radio.value === 'delivery') {
            deliveryAddress.style.display = 'block';
        } else {
            deliveryAddress.style.display = 'none';
        }
    });
});

orderForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const formObject = {};
    formData.forEach((value, key) => {
        formObject[key] = value;
    });

    const item = itemSelect.value;
    const quantity = document.querySelector('input[placeholder="Quantity"]').value;
    const weight = document.querySelector('input[placeholder="Weight in kg"]').value;
    const location = document.getElementById('location').value;
    
    // Create order summary
    let orderSummary = `Thank you for your order!\n\n`;
    orderSummary += `Item: ${itemSelect.options[itemSelect.selectedIndex].text}\n`;
    orderSummary += item === 'cake' || item === 'bread' 
        ? `Weight: ${weight} kg\n`
        : `Quantity: ${quantity} pieces\n`;
    orderSummary += `Location: ${location}\n`;
    orderSummary += `Total: Ksh ${totalPrice.textContent.split(' ')[1]}\n`;
    orderSummary += `\nWe will contact you soon to confirm the details.`;

    alert(orderSummary);
    this.reset();
});

// Feedback Form Handling
const feedbackForm = document.getElementById('feedbackForm');
feedbackForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const formObject = {};
    formData.forEach((value, key) => {
        formObject[key] = value;
    });

    // Simulate feedback submission
    alert('Thank you for your feedback! We appreciate your thoughts.');
    this.reset();
});

// Add animation on scroll
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.menu-item, .contact-item');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementBottom = element.getBoundingClientRect().bottom;
        
        if (elementTop < window.innerHeight && elementBottom > 0) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
};

// Initial animation check
animateOnScroll();

// Add scroll event listener
window.addEventListener('scroll', animateOnScroll);

// Add hover effects to menu items
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('mouseenter', () => {
        item.style.transform = 'scale(1.05)';
    });
    item.addEventListener('mouseleave', () => {
        item.style.transform = 'scale(1)';
    });
});
