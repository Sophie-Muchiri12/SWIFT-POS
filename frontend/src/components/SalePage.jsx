import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchItems,
  executeSale,
  updateSales,
} from "../redux/slices/itemSlice";
import { logout } from "../redux/slices/authenticationSlice";
import { useNavigate } from "react-router-dom";
import { RiLogoutCircleRLine, RiDashboardLine } from "react-icons/ri";
import { MdDeleteForever, MdInventory, MdPointOfSale } from "react-icons/md";
import { FaPlus, FaShoppingCart, FaUser } from "react-icons/fa";
import { FaMinus } from "react-icons/fa6";
import { BiSearch, BiRefresh } from "react-icons/bi";
import { HiOutlineCash } from "react-icons/hi";

function SalePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, token, isAuthenticated } = useSelector((state) => state.auth);
  const { items, isLoading, error } = useSelector((state) => state.items);

  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  // Fetch items on mount if authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      dispatch(fetchItems({ token }));
    }
  }, [dispatch, isAuthenticated, token]);

  // Filtered items based on search
  const filteredItems = items.filter((item) =>
    item.item_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add an item to the cart
  const addToCart = (item) => {
    if (item.quantity <= 0) {
      alert("Item out of stock");
      return;
    }
    
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (cartItem) => cartItem.item_id === item.item_id
      );
      return existingItem
        ? prevCart.map((cartItem) =>
            cartItem.item_id === item.item_id
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem
          )
        : [...prevCart, { ...item, quantity: 1 }];
    });
  };

  // Save cart data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Load cart data from localStorage when component mounts
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Update item quantity in the cart
  const updateQuantity = (item_id, change) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.item_id === item_id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  // Remove an item from the cart
  const removeItem = (item_id) => {
    setCart((prevCart) => prevCart.filter((item) => item.item_id !== item_id));
  };

  // Calculate Grand Total
  const grandTotal = cart.reduce(
    (total, item) => total + item.quantity * parseFloat(item.price || 0),
    0
  );

  // Execute Sale Function
  const handleExecuteSale = async () => {
    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    if (!token) {
      alert("Authentication token is missing. Please log in.");
      return;
    }

    const saleData = {
      staff: user.user_id,
      sale_items: cart.map((item) => ({
        item: item.item_id,
        quantity: item.quantity,
        price: parseFloat(item.price || 0),
      })),
    };

    try {
      await dispatch(executeSale({ saleData, token })).unwrap();
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 3000);
      setCart([]);
    } catch (error) {
      console.error("Sale execution failed:", error);
      alert("Sale execution failed: " + (error.detail || "Unknown error"));
    }
  };

  // Update Stock Function
  const handleUpdateSales = async () => {
    if (cart.length === 0) return;

    const updateSaleData = {
      staff: user.user_id,
      sale_items: cart.map((item) => ({
        item: item.item_id,
        quantity: item.quantity,
      })),
    };

    try {
      await dispatch(updateSales({ saleData: updateSaleData, token })).unwrap();
      setCart([]);
      dispatch(fetchItems({ token }));
    } catch (error) {
      console.error("Error updating sales:", error);
    }
  };

  // Execute Sale & Update Stock together
  const handleBothActions = async () => {
    await handleExecuteSale();
    await handleUpdateSales();
  };

  // Refresh inventory
  const handleRefreshInventory = () => {
    dispatch(fetchItems({ token }));
  };

  // Logout Function
  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const renderItemStatus = (quantity) => {
    if (quantity <= 0) {
      return <span className="text-xs py-1 px-2 bg-red-900 text-red-200 rounded-full">Out of Stock</span>;
    } else if (quantity < 5) {
      return <span className="text-xs py-1 px-2 bg-yellow-900 text-yellow-200 rounded-full">Low Stock</span>;
    }
    return null;
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-900 text-gray-100 overflow-hidden">
      {/* Side Navigation */}
      <div className="w-full md:w-16 bg-gray-800 flex md:flex-col flex-row items-center justify-between md:justify-start py-4 md:border-r border-gray-700">
        <div className="bg-green-600 rounded-full p-2 md:mb-8">
          <MdPointOfSale className="text-white text-2xl" />
        </div>
        
        <div className="flex md:flex-col flex-row items-center md:space-y-6 md:mt-2 space-x-4 md:space-x-0">
          <button className="p-3 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors" title="Dashboard">
            <RiDashboardLine className="text-xl" />
          </button>
          <button className="p-3 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors" title="Sales">
            <FaShoppingCart className="text-xl" />
          </button>
          <button className="p-3 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors" title="Inventory">
            <MdInventory className="text-xl" />
          </button>
        </div>
        
        <div className="md:mt-auto">
          <button 
            onClick={handleLogout}
            className="p-3 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors" 
            title="Logout">
            <RiLogoutCircleRLine className="text-xl" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-gray-800 px-6 py-4 flex items-center justify-between border-b border-gray-700">
          <h1 className="text-xl font-bold text-white flex items-center">
            <span className="text-green-500 mr-2">$</span>wift POS
          </h1>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleRefreshInventory}
              className="p-2 text-gray-400 hover:text-white transition-colors hidden md:block" 
              title="Refresh Inventory">
              <BiRefresh className="text-xl" />
            </button>
            <div className="hidden md:flex items-center bg-gray-700 px-4 py-2 rounded-lg">
              <FaUser className="text-green-500 mr-2" />
              <span className="text-white">
                {user.username
                  ? user.username
                      .split(" ")
                      .map(
                        (word) =>
                          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                      )
                      .join(" ")
                  : ""}
                <span className="text-gray-400 text-sm ml-2">
                  ({user.role
                    ? user.role
                        .split(" ")
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                        )
                        .join(" ")
                    : ""})
                </span>
              </span>
            </div>
            <button 
              onClick={handleRefreshInventory}
              className="p-2 text-gray-400 hover:text-white transition-colors md:hidden" 
              title="Refresh Inventory">
              <BiRefresh className="text-xl" />
            </button>
            <div className="md:hidden">
              <FaUser className="text-green-500" />
            </div>
          </div>
        </header>

        {/* Success Alert */}
        {showSuccessAlert && (
          <div className="absolute top-16 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50 animate-fade-in-out flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Sale completed successfully!
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:flex-row p-4 md:p-6 space-y-6 lg:space-y-0 lg:space-x-6 overflow-y-auto lg:overflow-hidden">
          {/* Available Items Section */}
          <div className="w-full lg:w-1/2 flex flex-col bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
            <div className="p-4 bg-gradient-to-r from-gray-800 to-gray-700 border-b border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <MdInventory className="mr-2 text-green-500" /> Inventory
              </h2>
              {/* Search Bar */}
              <div className="relative w-full md:w-2/3">
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pr-10 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <BiSearch className="absolute right-3 top-2.5 text-gray-400 text-xl" />
              </div>
            </div>
            
            {/* Items List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                </div>
              ) : error ? (
                <div className="p-6 bg-red-900/40 m-4 rounded-lg border border-red-800">
                  <p className="text-red-200 font-medium">{error.message || "Failed to fetch items"}</p>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <BiSearch className="text-5xl mb-2" />
                  <p>No items found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 p-4">
                  {filteredItems.map((item, index) => (
                    <div 
                      key={item.item_id}
                      className="bg-gray-750 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-all group"
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0">
                        <div className="w-full md:w-12 text-left md:text-center">
                          <span className="text-gray-400 text-sm">#{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-medium">
                            {item.item_name
                              ? item.item_name
                                  .split(" ")
                                  .map(
                                    (word) =>
                                      word.charAt(0).toUpperCase() +
                                      word.slice(1).toLowerCase()
                                  )
                                  .join(" ")
                              : ""}
                          </h3>
                          <div className="mt-1 md:hidden">
                            {renderItemStatus(item.quantity)}
                          </div>
                        </div>
                        <div className="hidden md:block md:w-24 text-center">
                          {/* <div className="text-gray-400 text-xs mb-1">Quantity</div> */}
                          <div className="text-white font-medium">{item.quantity}</div>
                        </div>
                        <div className="hidden md:block md:w-24 text-center">
                          {/* <div className="text-gray-400 text-xs mb-1">Price</div> */}
                          <div className="text-green-500 font-medium">Ksh. {parseFloat(item.price || 0).toFixed(2)}</div>
                        </div>

                        <div className="flex md:hidden justify-between w-full mt-2">
                          <div>
                            <span className="text-gray-400 text-xs">Quantity: </span>
                            <span className="text-white">{item.quantity}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 text-xs">Price: </span>
                            <span className="text-green-500">Ksh. {parseFloat(item.price || 0).toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="w-full md:w-28 text-left md:text-right mt-2 md:mt-0">
                          <button
                            className={`w-full md:w-auto px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center md:justify-start transition-colors ${
                              item.quantity <= 0
                                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                                : "bg-green-600 text-white hover:bg-green-700"
                            }`}
                            onClick={() => addToCart(item)}
                            disabled={item.quantity <= 0}
                          >
                            <FaPlus className="mr-1" size={10} />
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cart Section */}
          <div className="w-full lg:w-1/2 flex flex-col bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
            <div className="p-4 bg-gradient-to-r from-gray-800 to-gray-700 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <FaShoppingCart className="mr-2 text-green-500" /> Shopping Cart
              </h2>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <div className="bg-gray-700 rounded-full p-6 mb-4">
                    <FaShoppingCart className="text-5xl text-gray-500" />
                  </div>
                  <p className="text-lg mb-2">Your cart is empty</p>
                  <p className="text-gray-500 text-sm">Add items from the inventory to get started</p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {cart.map((item, index) => (
                    <div
                      key={item.item_id}
                      className="bg-gray-750 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-all"
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0">
                        <div className="w-full md:w-12 text-left md:text-center">
                          <span className="text-gray-400 text-sm">#{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-medium">
                            {item.item_name
                              ? item.item_name
                                  .split(" ")
                                  .map(
                                    (word) =>
                                      word.charAt(0).toUpperCase() +
                                      word.slice(1).toLowerCase()
                                  )
                                  .join(" ")
                              : ""}
                          </h3>
                        </div>
                        
                        <div className="w-full md:w-32 flex items-center justify-start md:justify-center mt-3 md:mt-0">
                          <div className="flex items-center bg-gray-700 rounded-lg overflow-hidden">
                            <button
                              className="p-2 text-white hover:bg-gray-600 transition-colors"
                              onClick={() => updateQuantity(item.item_id, -1)}
                              title="Decrease quantity"
                            >
                              <FaMinus size={10} />
                            </button>
                            <div className="px-3 py-1 bg-gray-800 text-white">
                              {item.quantity}
                            </div>
                            <button
                              className="p-2 text-white hover:bg-gray-600 transition-colors"
                              onClick={() => updateQuantity(item.item_id, 1)}
                              title="Increase quantity"
                            >
                              <FaPlus size={10} />
                            </button>
                          </div>
                        </div>
                        
                        <div className="hidden md:block md:w-24 text-center">
                          {/* <div className="text-gray-400 text-xs mb-1">Price</div> */}
                          <div className="text-white">Ksh. {parseFloat(item.price || 0).toFixed(2)}</div>
                        </div>
                        <div className="hidden md:block md:w-24 text-center">
                          {/* <div className="text-gray-400 text-xs mb-1">Total</div> */}
                          <div className="text-green-500 font-medium">
                            Ksh. {(item.quantity * parseFloat(item.price || 0)).toFixed(2)}
                          </div>
                        </div>
                        
                        <div className="flex md:hidden justify-between w-full mt-2">
                          <div>
                            <span className="text-gray-400 text-xs">Price: </span>
                            <span className="text-white">Ksh. {parseFloat(item.price || 0).toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 text-xs">Total: </span>
                            <span className="text-green-500">
                              Ksh. {(item.quantity * parseFloat(item.price || 0)).toFixed(2)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between w-full md:w-auto md:justify-end mt-2 md:mt-0">
                          <div className="w-10 text-right">
                            <button
                              className="p-2 text-red-500 hover:text-red-400 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                              onClick={() => removeItem(item.item_id)}
                              title="Remove item"
                            >
                              <MdDeleteForever size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Footer */}
            <div className="border-t border-gray-700 p-4 md:p-6">
              <div className="mb-4">
                <div className="flex justify-between text-gray-400 text-sm mb-2">
                  <span>Subtotal</span>
                  <span>Ksh. {grandTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400 text-sm mb-2">
                  <span>Tax (0%)</span>
                  <span>Ksh. 0.00</span>
                </div>
                <div className="flex justify-between text-xl font-bold mt-3">
                  <span className="text-white">Total</span>
                  <span className="text-green-500">Ksh. {grandTotal.toFixed(2)}</span>
                </div>
              </div>
              
              <button
                onClick={handleBothActions}
                disabled={cart.length === 0}
                className={`w-full py-3 px-4 rounded-lg text-white font-medium flex items-center justify-center transition-colors ${
                  cart.length === 0
                    ? "bg-gray-700 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                }`}
              >
                <HiOutlineCash className="mr-2 text-xl" />
                {cart.length === 0 ? "Cart Empty" : "Complete Sale"}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #2d3748;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #4a5568;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #718096;
        }
        
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(-10px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
        
        .animate-fade-in-out {
          animation: fadeInOut 3s ease-in-out;
        }
        
        .bg-gray-750 {
          background-color: #283141;
        }
        
        @media (max-width: 768px) {
          .lg\\:overflow-hidden {
            overflow-y: auto;
          }
        }
      `}</style>
    </div>
  );
}

export { SalePage as default };