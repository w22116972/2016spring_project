///**
//  * Created by Ambition on 5/22/16.
//  */
////import play.api.libs.json._
//import org.apache.spark.{SparkConf, SparkContext}
//import org.apache.spark.sql.{Row, SQLContext}
//import org.apache.spark.rdd.RDD
//
//object read_json {
//  def main(args: Array[String]) {
//    val conf = new SparkConf().setAppName("read_json").setMaster("local[4]")
//    val  sc = new SparkContext(conf)
//    val sql = new SQLContext(sc)
//
//    val list:RDD[(String,String)] = sc.wholeTextFiles("music/lastfm_subset/*/*/*")//獲取文檔內所有files
//
//    val json  = list.map(f = x => {
//
//      val song_id = x._1.split("/").last.stripSuffix(".json") // 切取id
//
//      val json: JsValue = Json.parse(x._2)
//
//      val tags = (json \ "tags" ).as[Array[Array[String]]]
//
//      val Array = tags.map(x=>x(0)) //把tags去除掉confidence
//
//      val Result = Array.mkString(",")  //切成String
//
//      (song_id+","+Result)
//    })
//    json.saveAsTextFile("result/q.csv");
//    //json.collect().foreach(println)
//    sc.stop()
//  }
//}
