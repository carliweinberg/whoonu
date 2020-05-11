import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;

public class Game {
  List<Player> players = new ArrayList<>();
  List<String> deck = new ArrayList<>();
  int handSize = 5;
  State state = State.WAITING_FOR_RESPONSES;
  List<Player> judgesPilePlayers = new ArrayList<>();
  List<String> judgesPileCards = new ArrayList<>();
  boolean isStarted = false;
  List<String> judgesOrdered = new ArrayList<>();

  enum State {
    WAITING_FOR_RESPONSES,
    WAITING_FOR_JUDGE
  }

  public void setup() {
    /// creates deck from txt file
    try {
      String content = new String(Files.readAllBytes(Paths.get("cards.txt")));
      String[] lines = content.split("\\r?\\n");
      for (String line : lines) {
        deck.add(line);
      }
    } catch (IOException e) {
      e.printStackTrace();
    }
    /// shuffles deck
    Collections.shuffle(deck);

    /// deal everyone cards
    for (int i = 0; i < players.size(); i++) {
      for (int j = 0; j < handSize; j++) {
        players.get(i).hand.add(deck.remove(0));
      }
    }
    /// set the judge
    players.get(0).isJudge = true;
    isStarted = true;
  }

  public void addPlayer(Player player) {
    players.add(player);
  }

  public boolean canSumbitToJudge(Player submittingPlayer) {
    return !judgesPilePlayers.contains(submittingPlayer);
  }

  public void submitToJudge(Player submittingPlayer, String submittedCard) {
    judgesPilePlayers.add(submittingPlayer);
    judgesPileCards.add(submittedCard);

    submittingPlayer.hand.remove(submittedCard);
    submittingPlayer.hand.add(deck.remove(0));

    if (judgesPilePlayers.size() == players.size() - 1) {
      readyToJudge();
    }
  }

  public void readyToJudge() {
    state = State.WAITING_FOR_JUDGE;
  }

  public void applyPointsToOrderedJudgesCard(List<String> orderedJudgesCards) {
    judgesOrdered = orderedJudgesCards;
    for (int i = 0; i < orderedJudgesCards.size(); i++) {
      for (int j = 0; j < judgesPileCards.size(); j++) {
        if (orderedJudgesCards.get(i).equals(judgesPileCards.get(j))) {
          ///added points to players
          judgesPilePlayers.get(j).score += judgesPilePlayers.size() - i;
        }
      }
    }
  }

  public void changeJudge() {
    judgesPileCards = new ArrayList<>();
    judgesPilePlayers = new ArrayList<>();

    for (int i = 0; i < players.size(); i++) {
      if (players.get(i).isJudge) {
        players.get(i).isJudge = false;
        if (i == players.size() - 1) {
          players.get(0).isJudge = true;
        } else {
          players.get(i + 1).isJudge = true;
        }
        break;
      }
    }
  }
}
