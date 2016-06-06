# How to download open dataset on Amazon ?

标签（空格分隔）： AWS

---
以 [Million Song Dataset](https://aws.amazon.com/datasets/million-song-dataset/) 為例

0. 我是在linux的環境
1. 登入AWS帳號進入AWS console裡
2. 選擇EC2 virtual server in cloud
3. 左方的EC2 dashborad，在網路與安全下進入Key pairs -> Create Key Pair -> 下載 .pem
4. dashboard -> Instances -> Instances -> Launch Instance
5. select **Amazon Linux AMI**
6. select **t2.micro** (Free tier)
7. Review and Launch
8. Security Group -> Edit security group -> Add rule
9. Type: SSH, Source: My IP -> Review and Launch
10. Instance Details -> Edit instance details -> Subnet: us-east-1a **(same as Availability Zone of Volume)** -> Review and Launch -> Launch
11. choose an existing key pair -> select a key pair created at step3 -> launch instance
12. dashboard -> Elastic Block Store -> Volumes -> create volume
13. 填入該資料集的Snapshot ID, 記得是在哪個 **Availability Zone** 例如要在us-east-1a
14. select that Volume -> Actions -> Attach Volume -> Instance: created at step11
16.  open terminal
17.  cd /../key_pair.pem
18.  chmod 400 key_pair.pem
19.  ssh -i key_pair.pem ec2-user@PUBLIC_DNS_of_INSTANCE
20.  在選擇instance後在Description裡看的到
20.  e.g. ssh -i key_pair.pem ec2-user@ec2-198-51-100-1.compute-1.amazonaws.com
21.  連線進入ec2之後輸入lsblk (檢查可用的disk device)
22.  有可能看到你要的巨量資料在/xvdf或/xvda1
23.  sudo file -s /dev/xvdf 如果輸出的是/dev/xvdf: data 則還要輸入sudo mkfs -t ext4 /dev/xvdf
23.  sudo file -s /dev/xvdf 如果輸出的是/dev/xvdf: Linux rev 1.0 ext4 filesystem data, UUID=.... 就沒事
24.  連線後就一直待在home的路徑(反正就之後要scp的路徑)sudo mkdir mount_point
25.  sudo mount /dev/xvdf mount_point
26.  開新的terminal
27.  cd 到有key_pair.pem的位置
28.  scp -i key_pair.pem ec2-user@PUBLIC_DNS_of_INSTANCE:~/mount_point/你要下載到本機端的資料 /../你想放的資料夾
29.  如果你要下載的是資料夾裡面所有的檔案的話，在scp後面加個-r就可以 -> /你要下載到本機端的資料夾




