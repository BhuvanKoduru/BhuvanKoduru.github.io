---
layout: page

description: An AI-powered agent to help users discover and recommend food spots — using recommendation logic and possibly retrieval-augmented generation.
img: assets/img/agent.jpg
importance: 1

title: "FoodieSpot AI Agent"
repo: "foodiespot-agent"
category: fun
importance: 1
tags: ["AI Agent", "Python", "Recommendation"]
---



Here's a <a href="https://drive.google.com/file/d/10Y34qgGaS7E-LpUfC8_m_oetmn0_ioj6/view?usp=drive_link"> video demo of the project </a> <br>
Here's the <a href="https://github.com/BhuvanKoduru/foodiespot-agent"> GitHub repo </a> <br>
Here's the <a href="https://www.notion.so/Creating-a-Restaurant-Reservation-Bot-19131cf78e8180e0a169c6727b9a72b0#19131cf78e818031ad1cc68c610a0671">detailed documentation of the project </a>

# Use case

This is a conversational AI assistant using Llama3.1 8B model to help users make restaurant reservations. It understands the user’s intent, and responds accordingly. It has access to a few functions, called tools, which are used to perform certain functionalities such as listing available locations, cuisine based recommendations, checking availabilities for the selected restaurant,  and finally making a booking for the user. Its main source of information is an SQLite database, which it reads from and updates as and when needed.

## Key Steps (Bot flow)

The FoodieSpot AI chatbot assists users with restaurant reservations through a structured, conversational flow. It begins by greeting the user and understanding their intent. If a reservation is requested, the bot collects details such as date, time, number of guests, and preferred location. If the user is unsure about restaurants, it fetches available locations. Once all details are confirmed, the bot finalizes the booking. If a restaurant is unavailable, it suggests alternatives. The chatbot also handles general inquiries about restaurants and menus, ensuring a smooth and helpful interaction before closing the conversation politely.

1. Greeting & Understanding Intent
User: "Hey, I want to book a table for dinner."
Bot: "Hi! Welcome to FoodieSpot! I'd be happy to assist you. Could you please provide the date and time for your reservation?"
2. Gathering Reservation Details
User: "Tomorrow at 6 PM."
Bot: "Great! How many seats will you need?"
User: "For 4 people."
Bot: "Do you have a specific restaurant in mind, or would you like to see our available locations?"
3. Fetching Restaurant Locations (if needed)
User: "What restaurants are available?"
Bot: (Calls get_locations(), then responds)
"Here are our available restaurants: Waffle Wonderland, Spicy Bites, Ocean’s Delight, and Green Garden. Which one would you like to book?"
4. Confirming Reservation
User: "I'd like to book at Spicy Bites."
Bot: "Just to confirm: You’d like to book a table at Spicy Bites for 4 people tomorrow at 6 PM. Shall I proceed with the reservation?"
User: "Yes, please."
Bot: (Calls confirm_reservation(location="Spicy Bites", date="Tomorrow", slot="6:00 PM", seats_needed=4))
Bot: "Your reservation at Spicy Bites for 4 people tomorrow at 6 PM has been successfully booked! Let me know if you need anything else."
5. Handling Unavailability
(If Spicy Bites is full)
Bot: "Unfortunately, Spicy Bites is fully booked for that time. Would you like me to find alternative restaurants for you?"
User: "Yes, please."
Bot: (Calls find_alternate_restaurants(date="Tomorrow", slot="6:00 PM", seats_needed=4))
Bot: "I found availability at Ocean’s Delight and Green Garden for the same time. Would you like to book one of these?"
User: "Let’s go with Ocean’s Delight."
Bot: (Calls confirm_reservation(location="Ocean’s Delight", date="Tomorrow", slot="6:00 PM", seats_needed=4))
Bot: "Your reservation at Ocean’s Delight for 4 people tomorrow at 6 PM is confirmed!"
6. Handling General Inquiries
User: "What kind of food does Waffle Wonderland serve?"
Bot: "Waffle Wonderland specializes in breakfast items like waffles, pancakes, and omelets, along with a selection of coffee and fresh juices."
7. Closing the Conversation
User: "Thanks for your help!"
Bot: "You're welcome! Enjoy your meal at FoodieSpot. Have a great day!"

The above can also be used to simulate real conversations with the chatbot upon running it. Also:

1. List all the restaurants you have
2. Which of these are Indian etc. can also be used.

