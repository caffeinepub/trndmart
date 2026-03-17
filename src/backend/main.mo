import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Blob "mo:core/Blob";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";

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

  // Retained for upgrade compatibility with previous stable state
  var adminClaimed : Bool = false;
  let accessControlState = AccessControl.initState();

  // Simple admin tracking via direct map -- no role system needed
  let adminPrincipals = Map.empty<Principal, Bool>();

  include MixinStorage();

  func isRegistered(caller : Principal) : Bool {
    userProfiles.get(caller) != null
  };

  func checkAdmin(caller : Principal) : Bool {
    switch (adminPrincipals.get(caller)) {
      case (?true) { true };
      case (_) { false };
    };
  };

  // Seed one sample product on first upgrade if store is empty
  system func postupgrade() {
    if (products.size() == 0) {
      let sampleProduct : Product = {
        id = "sample-001";
        name = "Premium Water Bottle 1L";
        description = "High-quality stainless steel water bottle, 1 litre capacity. Keeps drinks cold for 24 hours. Ideal for home, gym, and travel.";
        price = 49900;
        category = #bottles;
        image = Blob.fromArray([]);
        stock = 50;
        isAvailable = true;
      };
      products.add(sampleProduct.id, sampleProduct);
    };
  };

  public shared ({ caller }) func registerUser(name : Text) : async () {
    if (isRegistered(caller)) {
      Runtime.trap("User already registered");
    };
    let profile : UserProfile = { name };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func claimAdmin(secret : Text) : async () {
    if (secret != "admin123") {
      Runtime.trap("Invalid admin code");
    };
    if (not isRegistered(caller)) {
      Runtime.trap("You must sign up before claiming admin access");
    };
    adminPrincipals.add(caller, true);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    checkAdmin(caller)
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not checkAdmin(caller)) {
      Runtime.trap("Unauthorized");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not isRegistered(caller)) {
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
    if (not checkAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };
    products.add(product.id, product);
  };

  public shared ({ caller }) func updateProduct(product : Product) : async () {
    if (not checkAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };
    switch (products.get(product.id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) { products.add(product.id, product) };
    };
  };

  public shared ({ caller }) func deleteProduct(productId : Text) : async () {
    if (not checkAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };
    products.remove(productId);
  };

  public query ({ caller }) func getCart() : async [CartItem] {
    if (not isRegistered(caller)) {
      Runtime.trap("Unauthorized");
    };
    switch (carts.get(caller)) {
      case (null) { [] };
      case (?items) { items };
    };
  };

  public shared ({ caller }) func addToCart(item : CartItem) : async () {
    if (not isRegistered(caller)) {
      Runtime.trap("Unauthorized");
    };
    let currentCart = switch (carts.get(caller)) {
      case (null) { [] };
      case (?items) { items };
    };
    carts.add(caller, currentCart.concat([item]));
  };

  public shared ({ caller }) func removeFromCart(productId : Text) : async () {
    if (not isRegistered(caller)) {
      Runtime.trap("Unauthorized");
    };
    let currentCart = switch (carts.get(caller)) {
      case (null) { [] };
      case (?items) { items };
    };
    carts.add(caller, currentCart.filter(func(item) { item.productId != productId }));
  };

  public shared ({ caller }) func clearCart() : async () {
    if (not isRegistered(caller)) {
      Runtime.trap("Unauthorized");
    };
    carts.remove(caller);
  };

  public shared ({ caller }) func placeOrder(deliveryAddress : Text) : async Text {
    if (not isRegistered(caller)) {
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
    if (not checkAdmin(caller)) {
      Runtime.trap("Unauthorized");
    };
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) { orders.add(orderId, { order with status }) };
    };
  };

  public query ({ caller }) func getOrderHistory() : async [Order] {
    if (not isRegistered(caller)) {
      Runtime.trap("Unauthorized");
    };
    orders.values().toArray().filter(func(order) { order.userId == caller });
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not checkAdmin(caller)) {
      Runtime.trap("Unauthorized");
    };
    orders.values().toArray();
  };
};
