**Player, Currency, Collection**

* Player holds login info for every user.  
* Currency stores the user’s coins and crystals in one place, so deposits and spends are easy to track. It links back to Player one‑to‑one.  
* Collection lists which cards a user owns and how many copies. One row per user and card. When we delete a user, we also delete that user’s rows in Currency and Collection.

**Card**

A single list of all Pokémon cards—name, set, rarity, HP, and so on. Other tables point to this list. We block deleting a card if another table still refers to it, to keep references valid.

**Deck and DeckCard**

* Deck is a custom 60‑card pile made by one user.  
* DeckCard shows which cards are inside the deck and the copy count. If a deck is removed, its DeckCard rows are removed with it.

**Match and MatchPlayer**

* Match records when a game happened, the format, and its result.  
* MatchPlayer connects each player—and the deck they used—to that match. If a deck later disappears, we set its link in MatchPlayer to null so the match record still makes sense.

**Trade and TradeItem**

* Trade represents one card‑for‑card deal between two users.  
* TradeItem lists each card involved and which side is offering it. When a trade is cancelled or completed and removed, its TradeItem rows are also removed. A card cannot be deleted from the Card list if it is still listed in an open trade.

**Rules on deleting rows**

* Cascade when the child row means nothing without the parent (DeckCard, Collection).  
* Restrict on Card to prevent removing cards that are still referenced.  
* Set null only for `deck_id` in MatchPlayer, so match history remains even if the deck itself is gone.

This design covers users, money, cards, decks, matches, and trades without extra complexity, and keeps data consistent when rows are added or removed.