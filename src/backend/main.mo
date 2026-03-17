import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";



actor {
  public type Category = {
    #electronics;
    #kitchen;
    #bottles;
    #fans;
    #clothing;
    #homeDecor;
    #sports;
    #toys;
  };

  public type Product = {
    id : Text;
    name : Text;
    description : Text;
    price : Nat;
    category : Category;
    image : Storage.ExternalBlob;
    stock : Nat;
    isAvailable : Bool;
  };

  public type CartItem = {
    productId : Text;
    quantity : Nat;
  };

  public type OrderStatus = {
    #pending;
    #processing;
    #shipped;
    #delivered;
    #cancelled;
  };

  public type Order = {
    id : Text;
    userId : Principal;
    items : [CartItem];
    totalAmount : Nat;
    deliveryAddress : Text;
    status : OrderStatus;
    createdAt : Int;
  };

  public type UserProfile = {
    name : Text;
  };

  let products = Map.empty<Text, Product>();
  let carts = Map.empty<Principal, [CartItem]>();
  let orders = Map.empty<Text, Order>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var adminClaimed : Bool = false; // retained for upgrade compatibility

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  public shared ({ caller }) func registerUser(name : Text) : async () {
    if (userProfiles.get(caller) != null) {
      Runtime.trap("User already registered");
    };
    let profile : UserProfile = { name };
    userProfiles.add(caller, profile);
    AccessControl.assignRole(accessControlState, caller, caller, #user);
  };

  public shared ({ caller }) func claimAdmin(secret : Text) : async () {
    if (secret != "admin123") {
      Runtime.trap("Invalid admin code");
    };
    switch (userProfiles.get(caller)) {
      case (null) {
        Runtime.trap("You must sign up before claiming admin access");
      };
      case (?_) {
        AccessControl.assignRole(accessControlState, caller, caller, #admin);
      };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getProducts() : async [Product] {
    products.values().toArray();
  };

  public query ({ caller }) func getProductsByCategory(category : Category) : async [Product] {
    products.values().toArray().filter(func(p) { p.category == category });
  };

  public query ({ caller }) func getProduct(productId : Text) : async ?Product {
    products.get(productId);
  };

  public shared ({ caller }) func addProduct(product : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };
    products.add(product.id, product);
  };

  public shared ({ caller }) func updateProduct(product : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };
    switch (products.get(product.id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) { products.add(product.id, product) };
    };
  };

  public shared ({ caller }) func deleteProduct(productId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };
    products.remove(productId);
  };

  public query ({ caller }) func getCart() : async [CartItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    switch (carts.get(caller)) {
      case (null) { [] };
      case (?items) { items };
    };
  };

  public shared ({ caller }) func addToCart(item : CartItem) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    let currentCart = switch (carts.get(caller)) {
      case (null) { [] };
      case (?items) { items };
    };
    carts.add(caller, currentCart.concat([item]));
  };

  public shared ({ caller }) func removeFromCart(productId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    let currentCart = switch (carts.get(caller)) {
      case (null) { [] };
      case (?items) { items };
    };
    carts.add(caller, currentCart.filter(func(item) { item.productId != productId }));
  };

  public shared ({ caller }) func clearCart() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    carts.remove(caller);
  };

  public shared ({ caller }) func placeOrder(deliveryAddress : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    let cartItems = switch (carts.get(caller)) {
      case (null) { [] };
      case (?items) { items };
    };
    if (cartItems.size() == 0) { Runtime.trap("Cart is empty") };
    var totalAmount = 0;
    for (item in cartItems.values()) {
      switch (products.get(item.productId)) {
        case (null) { Runtime.trap("Product not found") };
        case (?product) { totalAmount += product.price * item.quantity };
      };
    };
    let orderId = Time.now().toText();
    let newOrder : Order = {
      id = orderId;
      userId = caller;
      items = cartItems;
      totalAmount;
      deliveryAddress;
      status = #pending;
      createdAt = Time.now();
    };
    orders.add(orderId, newOrder);
    carts.remove(caller);
    orderId;
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Text, status : OrderStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized");
    };
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) { orders.add(orderId, { order with status }) };
    };
  };

  public query ({ caller }) func getOrderHistory() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    orders.values().toArray().filter(func(order) { order.userId == caller });
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized");
    };
    orders.values().toArray();
  };
};
