<?php
require_once('dblayer.php');

class Grid
{
	private $database;
	
	public function Grid()
	{
		$this->database = new DBLayer("localhost", "gridsys", "password", "gridsys");
	}
	
	public function getUpdates($marker)
	{
		$result = $this->database->query("SELECT id, x, y, name, src, marker FROM tokens WHERE marker > $marker ORDER BY marker ASC");
		$num = mysql_num_rows($result);
		$data = "";
		$maxmarker;
		for($i = 0; $i < $num; $i++)
		{
			$id = mysql_result($result, $i, 'id');
			$x = mysql_result($result, $i, 'x');
			$y = mysql_result($result, $i, 'y');
			$name = mysql_result($result, $i, 'name');
			$src = mysql_result($result, $i, 'src');
			$marker = mysql_result($result, $i, 'marker');
			if( $marker <= 2 )
				$data .= "addtoken $id/flags/$name/$src\n";
				
			$data .= "token $id $x $y\n";
			$maxmarker = $marker;
		}
		$data .= "marker $marker";
		return $data;
	}
	
	public function getMarker()
	{
		return mysql_result($this->database->query("SELECT marker FROM tokens ORDER BY marker DESC LIMIT 0,1"), 0, 'marker');
	}
	
	/*public function addToken($id, $x, $y, $name, $src, $marker)
	{
		$this->token[$id] = new Token($id, $x, $y, $name, $src, $marker);
	}*/
	
	public function moveToken($id, $x, $y)
	{
		$marker = $this->getMarker() + 1;
		// Remove older moves, don't delete creation stuff with marker=2 (cuz this server be hacky)
		$this->database->query("DELETE FROM tokens WHERE id = '$id' AND marker < $marker AND marker > 2");
		$this->database->query("INSERT INTO tokens(id, x, y, marker) VALUES('$id', $x, $y, $marker)");
	}
	
	/*public function replaceToken($id, $name, $src)
	{
		$this->token[$id]->name = $name;
		$this->token[$id]->src = $src;
	}*/
}
?>