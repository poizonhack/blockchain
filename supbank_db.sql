-- phpMyAdmin SQL Dump
-- version 4.8.4
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Jun 07, 2019 at 12:40 AM
-- Server version: 5.7.24
-- PHP Version: 7.2.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `supbank_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `member`
--

DROP TABLE IF EXISTS `member`;
CREATE TABLE IF NOT EXISTS `member` (
  `id_mbr` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(15) NOT NULL,
  `email` varchar(50) NOT NULL,
  `pwd` varchar(50) NOT NULL,
  `pubkey` varchar(255) NOT NULL,
  PRIMARY KEY (`id_mbr`)
) ENGINE=InnoDB AUTO_INCREMENT=86 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `member`
--

INSERT INTO `member` (`id_mbr`, `name`, `email`, `pwd`, `pubkey`) VALUES
(79, 'alex', 'alex@live.fr', 'ab4f63f9ac65152575886860dde480a1', '04e1aa813bf0e107d145b6332c1f57be910c1a285cec0833af0325447dd297d358dc15c38f8cf5e2aaaf97aabccbd1b37895a4a822b9b8515278eaa7c9b7974199'),
(81, 'kaas', 'kaas@live.fr', 'ab4f63f9ac65152575886860dde480a1', '04b3f6915a0759e6d895edc710e3974c71d53481b6fd3bf0cc15ceb1fea3decfa9106644ad1958da0170d4d8e0b8c1ba0528bed91754a0aaf54081dd70e213874b'),
(83, 'toto', 'toto@live.fr', 'ab4f63f9ac65152575886860dde480a1', '04d25ce5bdd08e943790bcaa01da42130c4d343c7fc1691fc2ebff6e52727c65dc155a0a9ff33e4fd69bea64ef4c25b557e3801a0dc645c7276d6edf71a77562c0'),
(85, 'poisonhack', 'poison@hackme.ui', '63a9f0ea7bb98050796b649e85481845', '043fa479297b9192bb248d32079b115ee66aba0d83f1f4e258bf31b0ef33461978dbeec92adb184444e8a6e8f38b449706d10b61b4eaf49f09dc657fe273516021');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
