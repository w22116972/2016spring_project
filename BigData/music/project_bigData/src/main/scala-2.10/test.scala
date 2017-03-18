/**
  * Created by Ambition on 5/29/16.
  */

import org.apache.spark.ml.classification.DecisionTreeClassifier
import org.apache.spark.mllib.linalg.{SparseVector, DenseVector, Vectors}
import org.apache.spark.mllib.tree.configuration.{Algo, Strategy}
import org.apache.spark.{SparkConf, SparkContext}
import org.apache.spark.sql.{Row, SQLContext}
import org.apache.spark.mllib.tree.DecisionTree
import org.apache.spark.mllib.tree.impurity.Gini
import org.apache.spark.mllib.tree.model.DecisionTreeModel
import org.apache.spark.mllib.regression.LabeledPoint


object test {
  def main(args: Array[String]) {
    val conf = new SparkConf().setAppName("test").setMaster("local[4]")
    val sc = new SparkContext(conf)
    val sql = new SQLContext(sc)
// /Users/Ambition/Desktop/music/files/
    val songInfo = sc.textFile("src/SongIdAndInformation.csv")
    // yearArt = Array[(String, String)]
    val yearArt = songInfo.map(_.split(",")).map{ line =>
      (line(1), line(8)) // year, art
    }.collect()
    //println(yearArt(0)._1)
    //val test1 = Array((10, 1000), (10, 2000), (2, 3)).toMap
    //println(test1(10))

    //println(songInfo.take(5).mkString(","))
// /Users/Ambition/Downloads/
    // 經緯, Art1.., 地名..
    val artLocation = sc.textFile("src/artist_location.txt")
    // art = Array[String]
    var i = 0
    val art_class = artLocation
      .map(_.split("<SEP>"))
      .map(_(3))
      .distinct()
      .map{name =>
        i += 1
        (name, i)
      }.collect().toMap


// /Users/Ambition/Downloads/
    // year, loc, tag...
    val yearLocTag = sc.textFile("src/TagsWithYear.csv").map(_.split(","))
// /Users/Ambition/Downloads/
    i = 0
    val tag_class = sc.textFile("src/unique_tags.txt").map{tag =>
      i += 1
      (tag, i)
    }.collect().toMap
    //yearLocTag.take(10).foreach(_.mkString(","))
    //println("####")

    val yearTag = yearLocTag.flatMap{line =>
      val len = line.length
      var seq:Seq[(String, String)] = Seq()
      for (i <- 2 to len - 1) {
        seq = seq :+ (line(0), line(i))
      }
      seq
    }

    i = 0
    val loc_class = yearLocTag.map{ line =>
      i += 1
      (line(1), i)
    }.collect().toMap

    /** Year, Loc, Tag
      * Train: Loc, art.., tag
      * PredInterval train: 2000~2004, test: 2005, pred: 2006
      *
      * */
    val year_start: Int = 2000
    val interval: Int = 5
    val year_test: Int = year_start + interval + 1
    val art_len: Int = art_class.size

    // 1. data from 2000~2004
    val train = yearLocTag
      .filter(_(0).toInt >= year_start)
      .filter(_(0).toInt < year_start + interval)
      .map{ line =>
        var art_year_idx: Seq[(Int, Double)] = Seq()
        art_year_idx = art_year_idx :+ (0, loc_class(line(1)).toDouble)
        for (idx <- 0 to yearArt.size - 1) {
          if (line(0).toInt == yearArt(idx)._1.toInt) {
            // art_year_idx = loc_class, art_class1, art_class2...
            // art_year_idx(0) is left for loc_class, so start from idx + 1
            if (art_class.contains(yearArt(idx)._2) ) {
              art_year_idx = art_year_idx :+(art_class(yearArt(idx)._2), 1.0)
            }
          }
        }
        art_year_idx = art_year_idx.toSet.toSeq
        if (tag_class.contains(line(2))){
          LabeledPoint(tag_class(line(2)).toDouble, Vectors.sparse(1 + art_len, art_year_idx))
        }
        else if (line.length > 3 && tag_class.contains(line(3)) ) {
          LabeledPoint(tag_class(line(3)).toDouble, Vectors.sparse(1 + art_len, art_year_idx))
        }
        else {
          LabeledPoint(0.0, Vectors.sparse(1 + art_len, art_year_idx))
        }
      }
      .filter(_.label != 0.0)
      .cache()
    val train_first = train.first()
    val train_sample = train.take(5)

    println(train_first.features + " : " + train_first.label)


    val test = yearLocTag
      .filter(_(0).toInt >= year_test)
      .map{ line =>
        var art_year_idx: Seq[(Int, Double)] = Seq()
        art_year_idx = art_year_idx :+ (0, loc_class(line(1)).toDouble)
        for (idx <- 0 to yearArt.size - 1) {
          if (line(0).toInt == yearArt(idx)._1.toInt) {
            // art_year_idx = loc_class, art_class1, art_class2...
            // art_year_idx(0) is left for loc_class, so start from idx + 1
            if (art_class.contains(yearArt(idx)._2) ) {
              art_year_idx = art_year_idx :+(art_class(yearArt(idx)._2), 1.0)
            }
          }
        }
        art_year_idx = art_year_idx.toSet.toSeq
        if (tag_class.contains(line(2))){
          LabeledPoint(tag_class(line(2)).toDouble, Vectors.sparse(1 + art_len, art_year_idx))
        }
        else if (line.length > 3 && tag_class.contains(line(3)) ) {
          LabeledPoint(tag_class(line(3)).toDouble, Vectors.sparse(1 + art_len, art_year_idx))
        }
        else {
          LabeledPoint(0.0, Vectors.sparse(1 + art_len, art_year_idx))
        }
      }
      .filter(_.label != 0.0)

    // Train a DecisionTree model.
    //  Empty categoricalFeaturesInfo indicates all features are continuous.
    val numClasses = tag_class.size // number of tags
    var cateInfo: Map[Int, Int] = Map()
    cateInfo += (0 -> loc_class.size)
    for (j <- 1 to art_len) {
      cateInfo += (j -> 2)
    }
    val categoricalFeaturesInfo = cateInfo
    val impurity = "gini"
    val maxDepth = 5
    val maxBin = 32

    val strategy = new Strategy(Algo.Classification, Gini , maxDepth, numClasses, maxBins = maxBin, categoricalFeaturesInfo = categoricalFeaturesInfo, maxMemoryInMB = 1800)
//    val model = DecisionTree.trainClassifier(train, numClasses, categoricalFeaturesInfo,
//      impurity, maxDepth, maxBins)
    val model = DecisionTree.train(train, strategy)

    // Evaluate model on test instances and compute test error
    val labelAndPreds = test.map { point =>
      val prediction = model.predict(point.features)
      (point.label, prediction)
    }
    val testErr = labelAndPreds.filter(r => r._1 != r._2).count().toDouble / test.count()
    println("Test Error = " + testErr)
    println("Learned classification tree model:\n" + model.toDebugString)

    // Save and load model
    //model.save(sc, "target/tmp/myDecisionTreeClassificationModel")
    //val sameModel = DecisionTreeModel.load(sc, "target/tmp/myDecisionTreeClassificationModel")

//    val df = sql.read
//      .format("com.databricks.spark.csv")
//      .option("header", "true")
//      .option("inferSchema", "true")
//      .load("/Users/Ambition/Downloads/TagsWithYear_schema.csv")
//    df.select("tag").show()

//    val train = yearLocTag.map{field =>
//      val tag_len = field.length
//      var tag_feat =
//      for (i <- 2 to tag_len) {
//
//      }
//    }
    /*
       val yearLocArtTag = yearLocTag.map{ line =>
         // 該年有哪些歌手
         val artInYear = yearArt.filter(_._1 == line(0)).map(_._2)
         // 該年歌手在所有歌手中的index位置
         val idxArt = artInYear.map{name =>
           art.indexOf(name)
         }.collect()
         var ret = Array.fill(2 + art.length + 10)("0")
         ret(0) = line(0)
         ret(1) = line(1)
         idxArt.foreach(i =>
           ret(i + 2) = "1"
         )
         for (i <- 2 to 11) {
           if (line(i) != Nil) {
             ret(2 + art.length + i - 1) = line(i)
           }
         }

         ret.mkString(",")
       }
       yearLocArtTag.foreach(println)

       *
         * 把yearArt裡的year對應進yearLocArtTag，但是會有多對多的情形，不能用toMap否則會找不到對應的
         * 最後yearLocArtTag的輸出是(year, Loc, Art 1 .. Art N, Tag 1 .. Tag 10) => RDD[(Int, String, boolean .., String ..)]
         *
         * */

  }
}
