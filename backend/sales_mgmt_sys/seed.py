import random
from faker import Faker
from datetime import datetime, timedelta
from django.utils.timezone import make_aware
from pos_app.models.user import User
from pos_app.models.item import Item
from pos_app.models.sale import Sale
from pos_app.models.sale_item import SaleItem
from pos_app.models.rating import Rating

fake = Faker()

# Reset faker's unique data tracking
fake.unique.clear()

# ⚠️ Clear existing data before seeding
def clear_data():
    print("⚠️ Clearing existing data...")

    Rating.objects.all().delete()
    SaleItem.objects.all().delete()
    Sale.objects.all().delete()
    Item.objects.all().delete()
    User.objects.all().delete()

    print("Data cleared successfully!")

# Updated roles
roles = ["Manager", "Waiter", "Cashier", "Supervisor"]

# Predefined food and drink items
food_items = [
    "Croissant", "Chocolate Muffin", "Blueberry Muffin", "Banana Bread", "Cinnamon Roll",
    "Bagel with Cream Cheese", "Ham & Cheese Sandwich", "Chicken Avocado Sandwich",
    "Turkey Club Sandwich", "Veggie Wrap", "Caesar Salad", "Greek Salad",
    "Cheesecake", "Chocolate Brownie", "Apple Pie"
]

drink_items = [
    "Espresso", "Latte", "Cappuccino", "Mocha", "Americano",
    "Flat White", "Macchiato", "Chai Latte", "Iced Coffee", "Matcha Latte",
    "Fruit Smoothie", "Iced Tea"
]

# ⚡ Seed Users
def seed_users():
    users = []
    existing_emails = set(User.objects.values_list("email", flat=True))
    existing_usernames = set(User.objects.values_list("username", flat=True))

    for _ in range(20):
        email = fake.unique.email()
        username = fake.unique.user_name()

        # Ensure uniqueness
        while email in existing_emails:
            email = fake.unique.email()
        while username in existing_usernames:
            username = fake.unique.user_name()

        user, _ = User.objects.get_or_create(
            email=email,
            defaults={
                "first_name": fake.first_name(),
                "last_name": fake.last_name(),
                "phone_number": fake.phone_number(),
                "id_number": fake.random_int(min=100000, max=999999),
                "hire_date": make_aware(fake.date_time_between(start_date="-3y", end_date="now")),
                "termination_date": make_aware(fake.date_time_between(start_date="-2y", end_date="now")) if random.choice([True, False]) else None,
                "username": username,
                "password": fake.password(),
                "role": random.choice(roles),
                "is_active": random.choice([True, False]),
                "created_at": make_aware(fake.date_time_between(start_date="-3y", end_date="now")),
                "updated_at": make_aware(fake.date_time_between(start_date="-3y", end_date="now")),
            }
        )
        users.append(user)
        existing_emails.add(email)
        existing_usernames.add(username)

    return users

# ⚡ Seed Items (Food & Drinks)
def seed_items():
    items = []
    existing_item_names = set(Item.objects.values_list("item_name", flat=True))

    for item_name in food_items + drink_items:
        if item_name in existing_item_names:
            continue  

        item, _ = Item.objects.get_or_create(
            item_name=item_name,
            defaults={
                "price": round(random.uniform(2, 15), 2),
                "is_active": random.choice([True, False]),
                "quantity": random.randint(10, 100),
                "created_at": make_aware(fake.date_time_between(start_date="-2y", end_date="now")),
                "updated_at": make_aware(fake.date_time_between(start_date="-2y", end_date="now")),
            }
        )
        items.append(item)
        existing_item_names.add(item_name)

    return items

# ⚡ Seed Sales
def seed_sales(users):
    sales = []
    for _ in range(20):
        sale = Sale.objects.create(
            staff=random.choice(users),
            sale_date=fake.date_this_year(),
            total_amount=0,
            created_at=make_aware(fake.date_time_between(start_date="-1y", end_date="now")),
            updated_at=make_aware(fake.date_time_between(start_date="-1y", end_date="now")),
        )
        sales.append(sale)
    return sales

# ⚡ Seed SaleItems
def seed_sale_items(sales, items):
    for sale in sales:
        sale_items = []
        selected_items = random.sample(items, k=random.randint(1, 5))  # Each sale has 1 to 5 unique items

        for item in selected_items:
            quantity = random.randint(1, 5)
            subtotal = round(item.price * quantity, 2)

            sale_item = SaleItem.objects.create(
                sale=sale,
                item=item,
                quantity=quantity,
                subtotal=subtotal,
            )
            sale_items.append(sale_item)

        # Update total_amount for the sale
        sale.total_amount = sum(item.subtotal for item in sale_items)
        sale.save()

# ⚡ Seed Ratings
def seed_ratings(users):
    for _ in range(20):
        Rating.objects.create(
            staff=random.choice(users),
            rating_score=round(random.uniform(1, 5), 1),
            rating_date=fake.date_this_year(),
        )

# Run the Seeding Process
def run_seeding():
    clear_data()
    
    users = seed_users()
    items = seed_items()
    sales = seed_sales(users)
    seed_sale_items(sales, items)
    seed_ratings(users)

    print("Database successfully seeded with unique food, drinks, and users!")

# Execute seeding
run_seeding()
