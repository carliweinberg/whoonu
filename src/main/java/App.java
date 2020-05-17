import com.google.gson.Gson;

import java.util.Arrays;
import java.util.List;

import static spark.Spark.*;

public class App {
  Game game = new Game();

  public App() {

    port(80);

    // staticFiles.location("/public");

    options("/*", (request, response) -> {
      String accessControlRequestHeaders = request.headers("Access-Control-Request-Headers");
      if (accessControlRequestHeaders != null) {
        response.header("Access-Control-Allow-Headers", accessControlRequestHeaders);
      }

      String accessControlRequestMethod = request.headers("Access-Control-Request-Method");
      if (accessControlRequestMethod != null) {
        response.header("Access-Control-Allow-Methods", accessControlRequestMethod);
      }

      return "OK";
    });

    before((request, response) -> response.header("Access-Control-Allow-Origin", "*"));

    ///end a game
    post("/endGame", (request, response) -> {
      resetGame();
      return "";
    });

    ///adding a new player
    post("/players", (request, response) -> {
      Player player = new Player();
      player.username = request.body();
      game.addPlayer(player);
      return "";
    });

    ///starting a new game
    post("/game", (request, response) -> {
      game.setup();
      System.out.println("game: " + game);
      return "";
    });

    get("/game", (request, response) -> {
      response.type("application/json");
      Gson gson = new Gson();
      return gson.toJson(game);
    });

    post("/submitToJudge", (request, response) -> {
      if (game.state != Game.State.WAITING_FOR_RESPONSES) {
        response.status(400);
        return "Not time to submit";
      }
      String username = request.body().split(",")[0];
      String card = request.body().split(",")[1];

      Player player = null;
      for (int i = 0; i < game.players.size(); i++) {
        if (game.players.get(i).username.equals(username)) {
          player = game.players.get(i);
        }
      }
      if (player.isJudge) {
        response.status(400);
        return "You are the judge";
      }
      if (game.canSumbitToJudge(player)) {
        game.submitToJudge(player, card);
      } else {
        response.status(400);
        return "Silly goose, you already submitted";
      }
      return "";
    });

    post("/judgeSubmit", (request, response) -> {
      List<String> orderedJudgesCardsList = Arrays.asList(request.body().split(","));
      game.applyPointsToOrderedJudgesCard(orderedJudgesCardsList);
      game.state = Game.State.WAITING_FOR_RESPONSES;
      game.changeJudge();
      return "";
    });
  }

  private void resetGame() {
    game = new Game();
  }

  public static void main(String[] args) {
    new App();
  }
}
