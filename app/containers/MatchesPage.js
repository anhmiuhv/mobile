import React, { Component } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    RefreshControl
} from 'react-native';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as playerMatchesActions from '../actions/player_matches_act';
import { Actions } from 'react-native-router-flux';

import MatchesCard from '../components/MatchesCard';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import _ from 'lodash';

import Colors from '../themes/Colors';
import base from '../themes/BaseStyles';
import Fonts from '../themes/Fonts';

export const mapStateToProps = state => ({
    matches: state.playerMatchesState.matches,
    isLoadingMatches: state.playerMatchesState.isLoadingMatches,
    isEmptyMatches: state.playerMatchesState.isEmptyMatches,
    page: state.playerMatchesState.page,
    sortField: state.playerMatchesState.sortField,
    sortDirection: state.playerMatchesState.sortDirection,
    contextId: state.navigationState.contextId,
    legendHex: state.settingsState.legendHex,
    legend: state.settingsState.legend,
    secondLegend: state.settingsState.secondLegend,
    mod: state.settingsState.mod,
    alpha: state.settingsState.alpha,
    parent: state.navigationState.parent,
    tracker: state.navigationState.tracker
});

export const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators(playerMatchesActions, dispatch)
});

class MatchesPage extends Component {

    constructor(props) {
        super(props);
        this.onSearchPressed = this.onSearchPressed.bind(this);
        this.previousControl = (
            <TouchableOpacity onPress = {() => {this.props.actions.navigatePreviousMatches(1)}}>
                <View style = {{alignItems: 'center', alignSelf: 'center', justifyContent: 'center', paddingLeft: 0, paddingRight: 40}}>
                    <FontAwesome name = "chevron-left" size = {40} allowFontScaling = {false} color = {this.props.legend}/>
                </View>
            </TouchableOpacity>
        );
        this.previousTen = (
            <TouchableOpacity onPress = {() => {this.props.actions.navigatePreviousMatches(10)}}>
                <View style = {{alignItems: 'center', alignSelf: 'center', justifyContent: 'center', paddingLeft: 0, paddingRight: 20}}>
                    <FontAwesome name = "angle-double-left" size = {40} allowFontScaling = {false} color = {this.props.legend}/>
                </View>
            </TouchableOpacity>
        );
        this.nextControl = (
            <TouchableOpacity onPress = {() => {this.props.actions.navigateNextMatches(1)}}>
                <View style = {{alignItems: 'center', alignSelf: 'center', justifyContent: 'center', paddingLeft: 40, paddingRight: 0}}>
                    <FontAwesome name = "chevron-right" size = {40} allowFontScaling = {false} color = {this.props.legend}/>
                </View>
            </TouchableOpacity>
        );
        this.nextTen = (
            <TouchableOpacity onPress = {() => {this.props.actions.navigateNextMatches(10)}}>
                <View style = {{alignItems: 'center', alignSelf: 'center', justifyContent: 'center', paddingLeft: 20, paddingRight: 0}}>
                    <FontAwesome name = "angle-double-right" size = {40} allowFontScaling = {false} color = {this.props.legend}/>
                </View>
            </TouchableOpacity>
        );
        this.pageControl = (<View/>);
        this.state = {
            refreshing: false
        };

        this.sortMatches = this.sortMatches.bind(this);
    }

    componentDidMount() {
        this.props.tracker.trackScreenView('Matches');
    }

    onRefresh() {
        this.setState({refreshing: true});
        this.props.actions.fetchMatches(this.props.contextId).then(() => {
            this.setState({refreshing: false});
        });
    }

    onSearchPressed() {
        if(this.props.parent == "Favourites") {
            Actions.matchesSearchFavourite();
        } else if (this.props.parent == "Search") {
            Actions.matchesSearchSearch();
        } else if (this.props.parent == "Home") {
            Actions.matchesSearchHome();
        }
    }

    sortMatches(sortField, sortDirection) {
        this.props.actions.sortMatches(sortField, sortDirection);
    }

    componentWillMount() {
        if(!this.props.isLoadingMatches) {
            this.props.actions.fetchMatches(this.props.contextId, 30);
        }
    }

    componentWillReceiveProps(nextProps) {
        this.initialValue = 1 + ((nextProps.page - 1) * 20);
        this.endValue = nextProps.page * 20;
        this.totalMatches = nextProps.matches.length;
        let totalPages = Math.ceil(this.totalMatches/20);
        this.props.actions.setMaxPages(totalPages);
        if(this.totalMatches > 0) {
            if(this.endValue > this.totalMatches) {
                this.endValue = this.totalMatches;
            }
            this.matchesSubset = new Array();
            for(var i = this.initialValue - 1; i < this.endValue; i ++) {
                this.matchesSubset.push(nextProps.matches[i]);
            }
            if(this.initialValue == 1){
                this.pageControl = (
                    <View style={styles.paginationContainer}>
                        <FontAwesome style={styles.individualPageControlView} name = "chevron-left" size = {40} allowFontScaling = {false} color = "#00000000"/>
                        <View style={styles.pageContainer}>
                            <Text style={styles.individualPageControl}>{nextProps.page}</Text>
                        </View>
                        <View style = {{flexDirection: 'row'}}>
                            {this.nextControl}
                            {this.nextTen}
                        </View>
                    </View>
                );
            } else if (this.endValue == this.totalMatches) {
                this.pageControl = (
                    <View style={styles.paginationContainer}>
                        <View style = {{flexDirection: 'row'}}>
                            {this.previousTen}
                            {this.previousControl}
                        </View>
                        <View style={styles.pageContainer}>
                            <Text style={styles.individualPageControl}>{nextProps.page}</Text>
                        </View>
                        <FontAwesome style={styles.individualPageControlView} name = "chevron-right" size = {40} allowFontScaling = {false} color = "#00000000"/>
                    </View>
                );
            } else {
                var previousTenControl = (<View style = {{width: 40}}/>);
                var nextTenControl = (<View style = {{width: 40}}/>);
                this.pageControl = (
                    <View style={styles.paginationContainer}>
                        <View style = {{flexDirection: 'row'}}>
                            {this.previousTen}
                            {this.previousControl}
                        </View>
                        <View style={styles.pageContainer}>
                            <Text style={styles.individualPageControl}>{nextProps.page}</Text>
                        </View>
                        <View style = {{flexDirection: 'row'}}>
                            {this.nextControl}
                            {this.nextTen}
                        </View>
                    </View>
                );
            }
        } else if (this.totalMatches == 0) {
            this.matchesSubset = new Array();
            this.pageControl = (
                <View/>
            )
            this.initialValue = 0;
            this.endValue = 0;
        }
    }

    render() {
        var content = (<View />);
        if(this.props.isLoadingMatches) {
            content = (
                <View style = {styles.contentContainer}>
                    <ActivityIndicator size="large" color = {this.props.legend}/>
                </View>
            )
        } else if (this.props.isEmptyMatches) {
            content = (
                <View style = {styles.contentContainer}>
                    <Text style = {styles.noDataText}>No data found</Text>
                </View>
            )
        } else if (this.matchesSubset != null){
            var refreshColor = this.props.legendHex;
            content = (
                <KeyboardAwareScrollView style = {{marginTop: 5}}
                    refreshControl={
                        <RefreshControl
                            refreshing = {this.state.refreshing}
                            onRefresh = {this.onRefresh.bind(this)}
                            tintColor = {refreshColor}
                            title = 'Refreshing'
                            titleColor = {refreshColor}
                            colors = {[refreshColor]}
                            progressBackgroundColor="#ffffffff"
                        />
                    }>
                        <TouchableOpacity  onPress = {this.onSearchPressed} style = {styles.searchContainer}>
                            <View style = {[styles.searchIconContainer, {backgroundColor: this.props.alpha}]}>
                                <FontAwesome name = "search" size = {20} allowFontScaling = {false} color = {this.props.secondLegend}/>
                            </View>
                            <View style = {[styles.searchButton, {backgroundColor: this.props.alpha}]}>
                                <Text style = {[styles.searchButtonText, {color: this.props.secondLegend}]}>Search Matches</Text>
                            </View>
                        </TouchableOpacity>
                    <Text style = {styles.filterText}>
                        {this.initialValue} - {this.endValue} of {this.totalMatches} matches
                    </Text>
                    <MatchesCard matches = {this.matchesSubset} sortMatches = {this.sortMatches} default = {false} />
                    {this.pageControl}
                    <Text style = {styles.filterText}>
                        {this.initialValue} - {this.endValue} of {this.totalMatches} matches
                    </Text>
                </KeyboardAwareScrollView>
            )
        }

        return (
            <View style = {styles.container}>
                {content}
            </View>
        )
    }
}

const baseStyles = _.extend(base.general, {
    searchButton: {
        borderTopRightRadius: 3,
        borderBottomRightRadius: 3,
        paddingTop: 8,
        paddingBottom: 8,
        paddingRight: 10,
        marginTop: 5,
        marginBottom: 5,
        alignItems: 'flex-start',
        justifyContent: 'center',
        flex: 2
    },
    searchIconContainer: {
        borderTopLeftRadius: 3,
        borderBottomLeftRadius: 3,
        paddingTop: 8,
        paddingBottom: 8,
        paddingLeft: 10,
        paddingRight: 8,
        marginTop: 5,
        marginBottom: 5,
        alignItems: 'flex-end',
        justifyContent: 'center',
        flex: 1
    },
    searchButtonText: {
        fontFamily: Fonts.base,
        fontSize: 16
    },
    searchContainer: {
        flexDirection: 'row',
        paddingLeft: 10,
        paddingRight: 10,
        flex: 1
    },
    paginationContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        alignSelf: 'center',
        justifyContent: 'center'
    },
    individualPageControlView: {
        alignItems: 'center',
        alignSelf: 'center',
        justifyContent: 'center',
        paddingLeft: 40,
        paddingRight: 40
    },
    individualPageControl: {
        fontSize: 32
    },
    pageContainer: {
        alignItems: 'center',
        alignSelf: 'center',
        justifyContent: 'center',
        marginBottom: 5
    }

});

const styles = StyleSheet.create(baseStyles);

export default connect(mapStateToProps, mapDispatchToProps)(MatchesPage);
