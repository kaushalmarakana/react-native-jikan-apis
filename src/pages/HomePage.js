import React, { PureComponent } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import FastImage from "react-native-fast-image";
import { connect } from "react-redux";

import { AnimeApis } from "../apis/anime";
import {
  addDataToLocalStore,
  clearSearchedData,
} from "../redux/AppDuck/actions";
import { getCachedData } from "../redux/AppDuck/getters";
import { Colors } from "../utils/colors";
import { StyleVars } from "../utils/variables";

const SEARCH_HEIGHT = 40;
const CARD_WIDTH =
  (StyleVars.WINDOW_WIDTH -
    StyleVars.SCREEN_BOUNDERY * 2 -
    StyleVars.PRIMARY_SPACING) /
  2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.SHADE_2,
    paddingHorizontal: StyleVars.SCREEN_BOUNDERY,
  },
  searchRow: {
    flexDirection: "row",
    height: SEARCH_HEIGHT,
    marginTop: StyleVars.SCREEN_BOUNDERY,
  },
  input: {
    flex: 1,
    borderColor: "#fff",
    borderWidth: 1,
    color: Colors.LIGHT,
    borderRadius: StyleVars.BORDER_RADIUS_SM,
    paddingHorizontal: StyleVars.PRIMARY_SPACING,
  },
  searchBtn: {
    width: 60,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.LIGHT,
    borderRadius: StyleVars.BORDER_RADIUS_SM,
    marginLeft: StyleVars.PRIMARY_SPACING,
  },
  searchLabel: {
    fontSize: 20,
    color: Colors.DARK,
  },
  cardImage: {
    width: CARD_WIDTH,
    height: 200,
  },
  listStyle: {
    marginTop: StyleVars.PRIMARY_SPACING,
    marginHorizontal: -(StyleVars.PRIMARY_SPACING / 2),
  },
  animeCard: {
    flex: 1,
    marginHorizontal: StyleVars.PRIMARY_SPACING / 2,
    marginBottom: StyleVars.PRIMARY_SPACING,
    overflow: "hidden",
    borderColor: Colors.DARK,
    borderWidth: 1,
  },
  cardDescView: {
    minHeight: 50,
    backgroundColor: Colors.LIGHT,
    alignItems: "center",
    justifyContent: "center",
    padding: StyleVars.PRIMARY_SPACING / 2,
    flexGrow: 1,
    width: CARD_WIDTH,
  },
  cardTitle: {
    textAlign: "center",
  },
  loader: {
    marginVertical: StyleVars.PRIMARY_SPACING,
  },
  errText: {
    color: Colors.ERROR,
    marginTop: StyleVars.SCREEN_BOUNDERY,
    textAlign: "center",
  },
  fetchSourceText: {
    marginTop: StyleVars.PRIMARY_SPACING,
    textAlign: "center",
    color: Colors.LIGHT,
  },
});

// to avoid unnecessary re-rendering
class AnimeCard extends React.PureComponent {
  render() {
    const { item } = this.props;
    const source = { uri: item?.image_url || "" };
    return (
      <View style={styles.animeCard}>
        {/* using fast image for better caching on images  */}
        <FastImage
          style={styles.cardImage}
          source={source}
          resizeMode="cover"
        />
        <View style={styles.cardDescView}>
          <Text style={styles.cardTitle}>{item.title || ""}</Text>
        </View>
      </View>
    );
  }
}

class HomePage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      searchText: "Naruto",
      results: [],
      loading: false,
      err: "",
      page: 1,
      loadedAll: false,
      fetchSource: "",
    };
  }

  componentDidMount() {
    const { navigation } = this.props;
    const config = {
      title: "Jikan API",
      headerStyle: {
        backgroundColor: Colors.SHADE_1,
      },
      headerTintColor: Colors.LIGHT,
    };
    navigation.setOptions(config);
  }

  onSearch = (text) => {
    const st = {};
    st.searchText = text;
    this.setState(st);
  };

  search = async (force = false) => {
    const { page, results, loading, loadedAll } = this.state;
    let { searchText } = this.state;
    searchText = searchText.trim();

    const { jikanDataSet } = this.props;

    const st = {};
    if (loading || (loadedAll && !force)) {
      // for prevent multiple api call if not required
      return null;
    }

    try {
      if (force) {
        st.page = 1;
        st.results = [];
        st.loadedAll = false;
      } else {
        st.page = page + 1;
      }
      st.loading = true;
      st.err = "";
      this.setState(st);

      let newResults = [];

      const cachedData = jikanDataSet?.[searchText]?.[st.page] || [];

      // first checking in redux cache
      // if found then fetch it from redux else fetch from api and set in cache
      if (cachedData.length) {
        newResults = cachedData;
        st.fetchSource = `From Redux (Search: ${searchText}, page: ${st.page})`;
      } else {
        const resp = await AnimeApis.search(searchText, st.page);
        newResults = resp.data?.results || [];
        st.fetchSource = resp?.request?.responseURL || "";
      }

      if (force) {
        st.results = newResults;
      } else {
        st.results = [...results, ...newResults];
      }
      if (!cachedData.length) {
        // if fetched from api => set it in redux cache
        this.setDataToLocalStore(searchText, st.page, newResults);
      }
      st.loading = false;
      this.setState(st);
    } catch (err) {
      const errData = err?.response?.data;
      if (errData?.status === 404 && this.state.results.length) {
        // if 404 then data not found => all data loaded or no data available
        st.loadedAll = true;
      } else {
        st.err = "Something went wrong OR data not found";
      }
      st.loading = false;
      st.fetchSource = err?.request?.responseURL || "";
      this.setState(st);
    }
  };

  /**
   *
   * @param {*} searchText
   * @param {*} page
   * @param {*} data
   */
  setDataToLocalStore = (searchText, page, data) => {
    const { jikanDataSet, addSearchedDataToLocal } = this.props;
    const cachedData = { ...jikanDataSet }; // making copy, so original obj won't change
    cachedData[searchText] = {
      ...cachedData[searchText],
      [page]: data,
    };
    addSearchedDataToLocal(cachedData);
  };

  loadMore = () => {
    this.search(false);
  };

  onSearchPress = () => {
    this.setState(
      {
        results: [],
        fetchSource: "... Loading",
      },
      () => {
        // keepking timeout, so first list gets clear then will set new list
        setTimeout(() => {
          this.search(true);
        }, 500);
      },
    );
  };

  _renderCard = ({ item, index }) => {
    return <AnimeCard item={item} />; // to avoid unnecessary re-rendering
  };

  _renderListFooter = () => {
    const { loading } = this.state;
    if (loading) {
      return (
        <ActivityIndicator
          style={styles.loader}
          size="small"
          color={Colors.LIGHT}
        />
      );
    }
    return null;
  };

  _renderEmptyComp = () => {
    const { loading, err } = this.state;
    if (err || !loading) {
      return <Text style={styles.errText}>{err}</Text>;
    }
    return null;
  };

  render() {
    const { searchText, results, fetchSource } = this.state;
    return (
      <View style={styles.container}>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.input}
            onChangeText={this.onSearch}
            value={searchText}
            selectionColor={Colors.LIGHT}
          />
          <TouchableOpacity
            style={styles.searchBtn}
            onPress={this.onSearchPress}
            disabled={!searchText.length}>
            <Text style={styles.searchLabel}>GO</Text>
          </TouchableOpacity>
        </View>
        {Boolean(fetchSource) && (
          <Text style={styles.fetchSourceText}>
            Latest Fetched : {fetchSource}
          </Text>
        )}
        <FlatList
          style={styles.listStyle}
          // using index in keyExtractor
          // because there is no other unique reliable field which is unique for all search texts
          // sometimes in some searchText, same `mal_id` comes multiple times from api, so it is not reliable
          keyExtractor={(item, index) => index?.toString()}
          data={results}
          renderItem={this._renderCard}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={this._renderListFooter}
          ListEmptyComponent={this._renderEmptyComp}
          removeClippedSubviews
          onEndReached={this.loadMore}
        />
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    jikanDataSet: getCachedData(state) || {}, // get from cache
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    addSearchedDataToLocal: (data) => dispatch(addDataToLocalStore(data)), // update cache
    clearCachedData: () => dispatch(clearSearchedData()), // in case, if want to clear cache
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(HomePage);
