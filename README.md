# SQL_Squad

Building and execution of the application:

We chose to use phpMyAdmin for our database and Wheatley to host our website. In order to run the application, you will need to use your local host as Wheatley requires our credentials to access. Once you have placed the source code in your local host, you would then need to create an environments file to store the database configuration credentials. Once our database credentials are in the .env file, you can run the application by opening the index.php file in your browser.


Admin view:

The admin page allows users that are logged in as admins to monitor analytics, and manage users and reviews. It acts as a control panel for administrators of the CompareIt website. To have admin functionality, the user must have logged in with an account that's role is set to "admin". 
The admin page shows the total number of customers and retailers on the website, as well as the total number of products and reviews, with the review average. The admin page uses real-time updates without the user having to refresh the page. There is also a notification system that notifies the user of all of the actions being done.
The "User Management" page allows for the admin to allow and restrict access to the website for customers and retailers. When a retailer creates an account, their "is_active" field is automatically set to false, so the admin would first need to grant them access to the website before they can login and add products to CompareIt. The admin can also then use bulk actions to allow or restrict all customers and retailers from using the site, this can be used if the site needs maintenance and no one should be able to login until it is finished. Admins cannot change their own or other admins status. There is also the option to search by username or email, as well as sorting by role or status. The admin can also see all of the information about the user next to their name such as their email address, role, and activity if any. Additional information, such as role specific data and account details, can be found when clicking on the info icon to the left of the toggle switch. Users can then also be deleted by the admin by clicking on the icon to the right of the toggle switch. You are not able to delete or view additional information of any admin accounts. Deleted  users will also have all of their associated data deleted, such as reviews or listings. There are also confirmation dialogs to confirm actions on the admin page for extra security and to prevent accidents.
The "Analytics" page is used to show the admin different statistics about the website. The "User Status by Role" section uses a distribution to show the active vs inactive users with colour coordination, green showing active users, and red showing inactive users. The "Users by Role" section shows what percentage of the users are made up of each role. The "Review Distribution" section shows how many of each star review there are. The "Customer Engagement" section shows how many customers out of the total have left reviews, and the percentage of customers that have left reviews.
The "Review Management" page allows the admin to view and delete reviews in the case of any inappropriate reviews. The admin can search by either customer username, product name, or keywords in the review. It can also be sorted by rating so that the admin can only see reviews of a certain rating.


Retailer view:

The retailer page is used to manage the retailer's products and listings. It is only accessible to retailers.
It also shows the total number of products that retailer has listed on the website as well as the average price of all the products.
The retailer can add new products to the website by clicking the 'Add New Product' button, then filling out a form with the necessary product information. 
The retailer can edit existing product information by clicking the edit button on an individual product.
The retailer can delete individual  products by clicking the delete button, which is situated next to the edit button.
There is also the option for the retailer to delete all of there products by clicking the 'Delete All' button.
The retailer can also search for specific products they have listed on the website by using the search bar.


Customer view:

Example log in:
username:  Megan
password: Megan@23

Products page:
after log in, on products page. the customer can see all the different makeup products displayed. On this page, the customer can add to Wishlist, or go to the view page by pressing their corresponding buttons. This page displayed the product image, the name of the product, the rating, how many reviews, the description and if the product is in stock. On this page, the customer can search for the products which search through the database name and description to match the search. The customer can filter but makeup category and makeup brand

View Page:
On the view page of a specific product. This show  all the details of the products and all the listings (retailers with their prices). A graph is displayed underneath to help visualise. Gray means that retailer is out of stock of the product, dark green is for the retailer with the cheapest price, and lighter green for the retailers that are more expensive. Underneath the graph are product reviews. a customer can leave a review per product here and it will be displayed.

Wishlist: 
The Wishlist shows all the products added to the Wishlist page of the specific customer. a customer can remove a product from the Wishlist or go to the view page of that specific product. the rating and if the product is in stock is also displayed

Top rated:
Top rated page shows all the products but can then be filtered based on category, brand, how high of a rating and then sorted by highest rating or most reviews. The customer can also add to Wishlist and view the individual product from this