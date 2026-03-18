import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  include MixinStorage();

  // Category enumeration for provider types
  type Category = {
    #electrician;
    #plumber;
    #carpenter;
    #cleaner;
    #driver;
    #mason;
    #it;
    #other;
  };

  // Data types
  type User = {
    id : Principal;
    fullName : Text;
    phoneNumber : Text;
    location : Text;
    profession : Text;
    isProvider : Bool;
    isPremium : Bool;
    avatarUrl : ?Text;
    category : ?Category;
    portfolio : [Storage.ExternalBlob];
  };

  // UserProfile type required by the frontend
  type UserProfile = {
    fullName : Text;
    phoneNumber : Text;
    location : Text;
    profession : Text;
    isProvider : Bool;
    isPremium : Bool;
    avatarUrl : ?Text;
    category : ?Category;
    portfolio : [Storage.ExternalBlob];
  };

  module User {
    public func compare(user1 : User, user2 : User) : Order.Order {
      Text.compare(user1.fullName, user2.fullName);
    };

    public func compareByProfession(user1 : User, user2 : User) : Order.Order {
      Text.compare(user1.profession, user2.profession);
    };
  };

  // Review
  type Review = {
    reviewer : Principal;
    provider : Principal;
    stars : Nat;
    comment : Text;
    timestamp : Time.Time;
  };

  module Review {
    public func compareByTimestamp(review1 : Review, review2 : Review) : Order.Order {
      if (review1.timestamp < review2.timestamp) {
        #less;
      } else if (review1.timestamp > review2.timestamp) {
        #greater;
      } else {
        #equal;
      };
    };
  };

  // Message
  type Message = {
    senderId : Principal;
    receiverId : Principal;
    content : Text;
    timestamp : Time.Time;
    threadId : Text;
  };

  module Message {
    public func compareByTimestamp(msg1 : Message, msg2 : Message) : Order.Order {
      if (msg1.timestamp < msg2.timestamp) {
        #less;
      } else if (msg1.timestamp > msg2.timestamp) {
        #greater;
      } else {
        #equal;
      };
    };
  };

  // Storage
  let users = Map.empty<Principal, User>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let reviews = Map.empty<Principal, List.List<Review>>();
  let messages = Map.empty<Text, List.List<Message>>(); // threadId -> messages

  // Initialize the user system state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ---- Required profile functions ----

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
    // Also sync to users map
    let updatedUser : User = {
      id = caller;
      fullName = profile.fullName;
      phoneNumber = profile.phoneNumber;
      location = profile.location;
      profession = profile.profession;
      isProvider = profile.isProvider;
      isPremium = profile.isPremium;
      avatarUrl = profile.avatarUrl;
      category = profile.category;
      portfolio = profile.portfolio;
    };
    users.add(caller, updatedUser);
  };

  // ---- User Management ----

  public shared ({ caller }) func registerUser(fullName : Text, phoneNumber : Text, location : Text, profession : Text, isProvider : Bool, category : ?Category) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can register");
    };
    let newUser : User = {
      id = caller;
      fullName;
      phoneNumber;
      location;
      profession;
      isProvider;
      isPremium = false;
      avatarUrl = null;
      category;
      portfolio = [];
    };
    users.add(caller, newUser);
    let profile : UserProfile = {
      fullName;
      phoneNumber;
      location;
      profession;
      isProvider;
      isPremium = false;
      avatarUrl = null;
      category;
      portfolio = [];
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func updateAvatar(avatarUrl : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update their avatar");
    };
    let existingUser = switch (users.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?user) { user };
    };
    let updatedUser = { existingUser with avatarUrl = ?avatarUrl };
    users.add(caller, updatedUser);
    // Also update profile
    switch (userProfiles.get(caller)) {
      case (null) {};
      case (?profile) {
        let updatedProfile = { profile with avatarUrl = ?avatarUrl };
        userProfiles.add(caller, updatedProfile);
      };
    };
  };

  public query func getUser(userId : Principal) : async ?User {
    users.get(userId);
  };

  public query func searchProvidersByCategory(category : Category) : async [User] {
    users.values().filter(func(u) { u.isProvider and u.category == ?category }).toArray();
  };

  public query func searchProvidersByProfession(profession : Text) : async [User] {
    users.values().filter(func(u) { u.isProvider and u.profession.contains(#text profession) }).toArray();
  };

  public query func getAllProviders() : async [User] {
    users.values().filter(func(u) { u.isProvider }).toArray();
  };

  public shared ({ caller }) func uploadPortfolioFile() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can upload portfolio files");
    };
  };

  public shared ({ caller }) func removePortfolioFile(fileId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can remove portfolio files");
    };
  };

  // ---- Reviews ----

  public shared ({ caller }) func submitReview(provider : Principal, stars : Nat, comment : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can submit reviews");
    };
    if (stars < 1 or stars > 5) {
      Runtime.trap("Invalid: Stars must be between 1 and 5");
    };
    let newReview : Review = {
      reviewer = caller;
      provider;
      stars;
      comment;
      timestamp = Time.now();
    };

    let providerReviews = switch (reviews.get(provider)) {
      case (null) { List.empty<Review>() };
      case (?reviewsList) { reviewsList };
    };

    providerReviews.add(newReview);
    reviews.add(provider, providerReviews);
  };

  public query func getReviews(provider : Principal) : async [Review] {
    switch (reviews.get(provider)) {
      case (null) { [] };
      case (?reviewsList) {
        reviewsList.toArray().sort(Review.compareByTimestamp);
      };
    };
  };

  // ---- Messaging ----

  public shared ({ caller }) func sendMessage(receiverId : Principal, content : Text, threadId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can send messages");
    };
    let newMessage : Message = {
      senderId = caller;
      receiverId;
      content;
      timestamp = Time.now();
      threadId;
    };

    let threadMessages = switch (messages.get(threadId)) {
      case (null) { List.empty<Message>() };
      case (?msgList) { msgList };
    };

    threadMessages.add(newMessage);
    messages.add(threadId, threadMessages);
  };

  public query ({ caller }) func getMessages(threadId : Text) : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can read messages");
    };
    switch (messages.get(threadId)) {
      case (null) { [] };
      case (?msgList) {
        let allMessages = msgList.toArray().sort(Message.compareByTimestamp);
        // Verify caller is a participant in this thread
        let isParticipant = allMessages.find(
          func(m) { m.senderId == caller or m.receiverId == caller },
        );
        switch (isParticipant) {
          case (null) {
            Runtime.trap("Unauthorized: You are not a participant in this thread");
          };
          case (?_) { allMessages };
        };
      };
    };
  };

  public query ({ caller }) func getMessageThreads() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view message threads");
    };
    // Filter threads where caller is a participant
    messages.entries().filter(
      func((threadId, msgList)) {
        let msgs = msgList.toArray();
        let isParticipant = msgs.find(
          func(m) { m.senderId == caller or m.receiverId == caller },
        );
        switch (isParticipant) {
          case (null) { false };
          case (?_) { true };
        };
      }
    ).map(func((threadId, _)) { threadId }).toArray();
  };

  // Delete a message thread (user must be a participant)
  public shared ({ caller }) func deleteMessageThread(threadId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can delete message threads");
    };
    let msgList = switch (messages.get(threadId)) {
      case (null) { Runtime.trap("Thread not found") };
      case (?msgs) { msgs };
    };
    // Verify caller is a participant in the thread
    let isParticipant = msgList.toArray().find(
      func(m) { m.senderId == caller or m.receiverId == caller },
    );
    switch (isParticipant) {
      case (null) {
        Runtime.trap("Unauthorized: You are not a participant in this thread");
      };
      case (?_) {
        messages.remove(threadId);
      };
    };
  };
};
