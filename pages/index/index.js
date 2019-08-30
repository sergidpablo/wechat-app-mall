const WXAPI = require('../../wxapi/main')
const CONFIG = require('../../config.js')
const regeneratorRuntime = require('../../utils/runtime')
//获取应用实例
var app = getApp()
Page({
  data: {
    inputShowed: false, // 是否显示搜索框
    inputVal: "", // 搜索框内容
    category_box_width: 750, //分类总宽度
    goodsRecommend: [], // 推荐商品
    kanjiaList: [], //砍价商品列表
    pingtuanList: [], //拼团商品列表
    kanjiaGoodsMap: {}, //砍价商品列表

    indicatorDots: true,
    autoplay: true,
    interval: 3000,
    duration: 1000,
    loadingHidden: false, // loading
    userInfo: {},
    swiperCurrent: 0,
    selectCurrent: 0,
    categories: [],
    activeCategoryId: 0,
    goods: [],

    scrollTop: 0,
    loadingMoreHidden: true,

    coupons: [],

    curPage: 1,
    pageSize: 20,
    cateScrollTop: 0,
    hideShopPopup: true,
    shopCarInfo: {},
    propertyChildIds: "",
    propertyChildNames: "",
    canSubmit: false,
    shopNum: 0,

    buyNumber: 0,
    buyNumMin: 1,
    buyNumMax: 0,
    selectSize: "选择：",
    selectSizePrice: 0,
  },
  toAddShopCar: function () {
    this.setData({
      shopType: "addShopCar"
    })
    this.bindGuiGeTap();
  },
  closePopupTap: function () {
    this.setData({
      hideShopPopup: true
    })
  },
  closePopupTap2: function () {
    this.setData({
      inputVal: ""
    });
  },
  
  
  bindGuiGeTap: function () {
    this.setData({
      hideShopPopup: false
    })
  },
  

  
  addShopCarSenseProperties: function () {
    if (this.data.goodsDetail.properties && !this.data.canSubmit) {

      this.bindGuiGeTap();
      return;
    }
    if (this.data.buyNumber < 1) {
      wx.showModal({
        title: '提示',
        content: '没有库存',
        showCancel: false
      })
      return;
    }
    //组建购物车
    var shopCarInfo = this.bulidShopCarInfoSensePropertys();

    this.setData({
      shopCarInfo: shopCarInfo,
      shopNum: shopCarInfo.shopNum
    });

    // 写入本地存储
    wx.setStorage({
      key: 'shopCarInfo',
      data: shopCarInfo
    })


    if (this.data.shopNum > 0) {
      wx.setTabBarBadge({
        index: 2,
        text: '' + this.data.shopNum + ''
      })
    } else {
      wx.removeTabBarBadge({
        index: 2,
      })
    }
    this.closePopupTap();
      wx.showToast({
        title: '加入购物车成功',
        icon: 'success',
        duration: 2000
      })
    //console.log(shopCarInfo);

    //shopCarInfo = {shopNum:12,shopList:[]}
  },
  addShopCar: function () {
    if (this.data.goodsDetail.properties && !this.data.canSubmit) {

      this.bindGuiGeTap();
      return;
    }
    if (this.data.buyNumber < 1) {
      wx.showModal({
        title: '提示',
        content: '没有库存',
        showCancel: false
      })
      return;
    }
    //组建购物车
    var shopCarInfo = this.bulidShopCarInfo();

    this.setData({
      shopCarInfo: shopCarInfo,
      shopNum: shopCarInfo.shopNum
    });

    // 写入本地存储
    wx.setStorage({
      key: 'shopCarInfo',
      data: shopCarInfo
    })

    if (this.data.shopNum > 0) {
      wx.setTabBarBadge({
        index: 2,
        text: '' + this.data.shopNum + ''
      })
    } else {
      wx.removeTabBarBadge({
        index: 2,
      })
    }
    this.closePopupTap();
    wx.showToast({
      title: '加入购物车成功',
      icon: 'success',
      duration: 2000
    })
    //console.log(shopCarInfo);

    //shopCarInfo = {shopNum:12,shopList:[]}
  },
  bulidShopCarInfo: function () {
    // 加入购物车
    var shopCarMap = {};
    shopCarMap.goodsId = this.data.goodsDetail.basicInfo.id;
    shopCarMap.pic = this.data.goodsDetail.basicInfo.pic;
    shopCarMap.name = this.data.goodsDetail.basicInfo.name;
    // shopCarMap.label=this.data.goodsDetail.basicInfo.id; 规格尺寸 
    shopCarMap.propertyChildIds = this.data.propertyChildIds;
    shopCarMap.label = this.data.propertyChildNames;
    shopCarMap.price = this.data.selectSizePrice;
    shopCarMap.score = this.data.totalScoreToPay;
    shopCarMap.left = "";
    shopCarMap.active = true;
    shopCarMap.number = this.data.buyNumber;
    shopCarMap.logisticsType = this.data.goodsDetail.basicInfo.logisticsId;
    shopCarMap.logistics = this.data.goodsDetail.logistics;
    shopCarMap.weight = this.data.goodsDetail.basicInfo.weight;

    var shopCarInfo = this.data.shopCarInfo;
    if (!shopCarInfo.shopNum) {
      shopCarInfo.shopNum = 0;
    }
    if (!shopCarInfo.shopList) {
      shopCarInfo.shopList = [];
    }
    var hasSameGoodsIndex = -1;
    for (var i = 0; i < shopCarInfo.shopList.length; i++) {
      var tmpShopCarMap = shopCarInfo.shopList[i];
      if (tmpShopCarMap.goodsId == shopCarMap.goodsId && tmpShopCarMap.propertyChildIds == shopCarMap.propertyChildIds) {
        hasSameGoodsIndex = i;
        shopCarMap.number = shopCarMap.number + tmpShopCarMap.number;
        break;
      }
    }

    shopCarInfo.shopNum = shopCarInfo.shopNum + this.data.buyNumber;
    if (hasSameGoodsIndex > -1) {
      shopCarInfo.shopList.splice(hasSameGoodsIndex, 1, shopCarMap);
    } else {
      shopCarInfo.shopList.push(shopCarMap);
    }
    shopCarInfo.kjId = this.data.kjId;
    return shopCarInfo;
  },
  bulidShopCarInfoSensePropertys: function () {
    // 加入购物车
    var shopCarMap = {};
    shopCarMap.goodsId = this.data.goodsDetail.basicInfo.id;
    shopCarMap.pic = this.data.goodsDetail.basicInfo.pic;
    shopCarMap.name = this.data.goodsDetail.basicInfo.name;
    // shopCarMap.label=this.data.goodsDetail.basicInfo.id; 规格尺寸 
    shopCarMap.propertyChildIds = "";
    shopCarMap.label = "";
    shopCarMap.price = this.data.selectSizePrice;
    shopCarMap.score = this.data.totalScoreToPay;
    shopCarMap.left = "";
    shopCarMap.active = true;
    shopCarMap.number = this.data.buyNumber;
    shopCarMap.logisticsType = this.data.goodsDetail.basicInfo.logisticsId;
    shopCarMap.logistics = this.data.goodsDetail.logistics;
    shopCarMap.weight = this.data.goodsDetail.basicInfo.weight;

    var shopCarInfo = this.data.shopCarInfo;
    if (!shopCarInfo.shopNum) {
      shopCarInfo.shopNum = 0;
    }
    if (!shopCarInfo.shopList) {
      shopCarInfo.shopList = [];
    }
    var hasSameGoodsIndex = -1;
    for (var i = 0; i < shopCarInfo.shopList.length; i++) {
      var tmpShopCarMap = shopCarInfo.shopList[i];
      if (tmpShopCarMap.goodsId == shopCarMap.goodsId && tmpShopCarMap.propertyChildIds == shopCarMap.propertyChildIds) {
        hasSameGoodsIndex = i;
        shopCarMap.number = shopCarMap.number + tmpShopCarMap.number;
        break;
      }
    }

    shopCarInfo.shopNum = shopCarInfo.shopNum + this.data.buyNumber;
    if (hasSameGoodsIndex > -1) {
      shopCarInfo.shopList.splice(hasSameGoodsIndex, 1, shopCarMap);
    } else {
      shopCarInfo.shopList.push(shopCarMap);
    }
    shopCarInfo.kjId = this.data.kjId;
    return shopCarInfo;
  },
  async getGoodsDetailAndKanjieInfo(e) {
    const that = this;
    let goodsId = e.currentTarget.dataset.id;
    const goodsDetailRes = await WXAPI.goodsDetail(goodsId)
    if (goodsDetailRes.code == 0) {
      var selectSizeTemp = "";
      if (goodsDetailRes.data.properties) {
        for (var i = 0; i < goodsDetailRes.data.properties.length; i++) {
          selectSizeTemp = selectSizeTemp + " " + goodsDetailRes.data.properties[i].name;
        }
        that.setData({
          hasMoreSelect: true,
          selectSize: that.data.selectSize + selectSizeTemp,
          selectSizePrice: goodsDetailRes.data.basicInfo.minPrice,
          totalScoreToPay: goodsDetailRes.data.basicInfo.minScore
        });
      }
      that.data.goodsDetail = goodsDetailRes.data;
      let _data = {
        goodsDetail: goodsDetailRes.data,
        selectSizePrice: goodsDetailRes.data.basicInfo.minPrice,
        totalScoreToPay: goodsDetailRes.data.basicInfo.minScore,
        buyNumMax: goodsDetailRes.data.basicInfo.stores,
        buyNumber: (goodsDetailRes.data.basicInfo.stores > 0) ? 1 : 0,
        currentPages: getCurrentPages()
      }
      that.setData(_data);

      if (goodsDetailRes.data.properties) {
        this.bindGuiGeTap();
      }
      if (!goodsDetailRes.data.properties) {
        this.addShopCarSenseProperties();
      }
    }
    this.setData({
      shopType: "addShopCar"
    })
  },

  labelItemTap: function (e) {
    var that = this;
    /*
    console.log(e)
    console.log(e.currentTarget.dataset.propertyid)
    console.log(e.currentTarget.dataset.propertyname)
    console.log(e.currentTarget.dataset.propertychildid)
    console.log(e.currentTarget.dataset.propertychildname)
    */
    // 取消该分类下的子栏目所有的选中状态
    var childs = that.data.goodsDetail.properties[e.currentTarget.dataset.propertyindex].childsCurGoods;
    for (var i = 0; i < childs.length; i++) {
      that.data.goodsDetail.properties[e.currentTarget.dataset.propertyindex].childsCurGoods[i].active = false;
    }
    // 设置当前选中状态
    that.data.goodsDetail.properties[e.currentTarget.dataset.propertyindex].childsCurGoods[e.currentTarget.dataset.propertychildindex].active = true;
    // 获取所有的选中规格尺寸数据
    var needSelectNum = that.data.goodsDetail.properties.length;
    var curSelectNum = 0;
    var propertyChildIds = "";
    var propertyChildNames = "";
    for (var i = 0; i < that.data.goodsDetail.properties.length; i++) {
      childs = that.data.goodsDetail.properties[i].childsCurGoods;
      for (var j = 0; j < childs.length; j++) {
        if (childs[j].active) {
          curSelectNum++;
          propertyChildIds = propertyChildIds + that.data.goodsDetail.properties[i].id + ":" + childs[j].id + ",";
          propertyChildNames = propertyChildNames + that.data.goodsDetail.properties[i].name + ":" + childs[j].name + "  ";
        }
      }
    }
    var canSubmit = false;
    if (needSelectNum == curSelectNum) {
      canSubmit = true;
    }
    // 计算当前价格
    if (canSubmit) {
      WXAPI.goodsPrice({
        goodsId: that.data.goodsDetail.basicInfo.id,
        propertyChildIds: propertyChildIds
      }).then(function (res) {
        that.setData({
          selectSizePrice: res.data.price,
          totalScoreToPay: res.data.score,
          propertyChildIds: propertyChildIds,
          propertyChildNames: propertyChildNames,
          buyNumMax: res.data.stores,
          buyNumber: (res.data.stores > 0) ? 1 : 0
        });
      })
    }


    this.setData({
      goodsDetail: that.data.goodsDetail,
      canSubmit: canSubmit
    })
  },
  numJianTap: function () {
    if (this.data.buyNumber > this.data.buyNumMin) {
      var currentNum = this.data.buyNumber;
      currentNum--;
      this.setData({
        buyNumber: currentNum
      })
    }
  },
  numJiaTap: function () {
    if (this.data.buyNumber < this.data.buyNumMax) {
      var currentNum = this.data.buyNumber;
      currentNum++;
      this.setData({
        buyNumber: currentNum
      })
    }
  },
  initData() {
    let that = this;
    wx.showNavigationBarLoading();
    wx.request({
      url: 'https://api.it120.cc/' + CONFIG.subDomain + '/shop/goods/category/all',
      success: function (res) {
        var categories = [{ id: 0, type: "All", name: "所有分类" }];
        if (res.data.code == 0) {
          wx.hideLoading();
          for (var i = 0; i < res.data.data.length; i++) {
            if (res.data.data[i].level == 1) {
              categories.push(res.data.data[i]);
            }
          }
        }//
        that.setData({
          categories: categories,
          activeCategoryId: 0
        });
        that.getGoodsList2(0);
      }
    })

  },
  getGoodsList2: function (categoryId, append) {
    let that = this;
    WXAPI.goods({
      categoryId: "",
      page: 1,
      barCode: 'RETAIL',
      pageSize: 100000
    }).then(function (res) {
      if (res.code == 404 || res.code == 700) {
        return
      }
      let goodsWrap = [];
      that.data.categories.forEach((o, index) => {
        let wrap = {};
        wrap.id = o.id;
        wrap.chinesename = o.type;
        wrap.scrollId = "s" + o.id;
        wrap.name = o.name;
        wrap.pic = o.icon;
        let goods = [];
        wrap.goods = goods;
        res.data.forEach((item, i) => {
          if (item.categoryId == wrap.id) {
            goods.push(item)
          }
        })

        goodsWrap.push(wrap);
      })



      that.setData({
        goodsWrap: goodsWrap,
      });

      console.log(goodsWrap);

      wx.hideNavigationBarLoading();
    }).catch((e) => {

      wx.hideNavigationBarLoading();
    });
  },
  tabClick: function (e) {
    let offset = e.currentTarget.offsetLeft;
    if (offset > 150) {
      offset = offset - 150
    } else {
      offset = 0;
    }
    this.setData({
      activeCategoryId: e.currentTarget.id,
      curPage: 1,
      cateScrollTop: offset
    });
    this.getGoodsList(this.data.activeCategoryId);
  },
  //事件处理函数
  swiperchange: function (e) {
    //console.log(e.detail.current)
    this.setData({
      swiperCurrent: e.detail.current
    })
  },
  toDetailsTap: function (e) {
    wx.navigateTo({
      url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
    })
  },
  tapBanner: function (e) {
    if (e.currentTarget.dataset.id != 0) {
      wx.navigateTo({
        url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
      })
    }
  },
  bindTypeTap: function (e) {
    this.setData({
      selectCurrent: e.index
    })
  },
  onLoad: function (e) {
    wx.showShareMenu({
      withShareTicket: true
    })

    const that = this
    
    
    this.initData()
    if (e && e.scene) {
      const scene = decodeURIComponent(e.scene)
      if (scene) {
        wx.setStorageSync('referrer', scene.substring(11))
      }
    }
    wx.setNavigationBarTitle({
      title: wx.getStorageSync('mallName')
    })
    /**
     * 示例：
     * 调用接口封装方法
     */
    WXAPI.banners({
      type: 'new'
    }).then(function (res) {
      if (res.code == 700) {
      } else {
        that.setData({
          banners: res.data
        });
      }
    }).catch(function (e) {
      wx.showToast({
        title: res.msg,
        icon: 'none'
      })
    })

    WXAPI.goods({
      recommendStatus: 1
    }).then(res => {
      if (res.code === 0) {
        that.setData({
          goodsRecommend: res.data
        })
      }
    })





    that.getCoupons()
    that.getNotice()
    that.kanjiaGoods()
    that.pingtuanGoods()
  },
  onPageScroll(e) {
    let scrollTop = this.data.scrollTop
    this.setData({
      scrollTop: e.scrollTop
    })
  },
  getGoodsList: function (categoryId, append) {
    if (categoryId == 0) {
      categoryId = "";
    }
    var that = this;
    wx.showLoading({
      "mask": true
    })
    WXAPI.goods({
      categoryId: categoryId,
      nameLike: that.data.inputVal,
      page: this.data.curPage,
      pageSize: this.data.pageSize
    }).then(function (res) {
      wx.hideLoading()
      if (res.code == 404 || res.code == 700) {
        let newData = {
          loadingMoreHidden: false
        }
        if (!append) {
          newData.goods = []
        }
        that.setData(newData);
        return
      }
      let goods = [];
      if (append) {
        goods = that.data.goods
      }
      for (var i = 0; i < res.data.length; i++) {
        goods.push(res.data[i]);
      }
      that.setData({
        loadingMoreHidden: true,
        goods: goods,
      });
    })
  },
  getCoupons: function () {
    var that = this;
    WXAPI.coupons().then(function (res) {
      if (res.code == 0) {
        that.setData({
          coupons: res.data
        });
      }
    })
  },

  onShow() {
    const that = this
    wx.getStorage({
      key: 'shopCarInfo',
      success: function (res) {
        that.setData({
          shopCarInfo: res.data,
          shopNum: res.data.shopNum,
          curuid: wx.getStorageSync('uid')
        });
        if (res.data.shopNum > 0) {
          wx.setTabBarBadge({
            index: 2,
            text: '' + res.data.shopNum + ''
          })
        } 
      }
    })

    wx.request({
      url: 'https://api.it120.cc/' + CONFIG.subDomain + '/order/statistics',
      data: { token: wx.getStorageSync('token') },
      success: function (res) {
        if (res.data.code == 0) {
          if (res.data.data.count_id_no_pay > 0) {
            wx.setTabBarBadge({
              index: 4,
              text: '' + res.data.data.count_id_no_pay + ''
            })
          } else {
            wx.removeTabBarBadge({
              index: 4,
            })
          }
          that.setData({
            noplay: res.data.data.count_id_no_pay,
            notransfer: res.data.data.count_id_no_transfer,
            noconfirm: res.data.data.count_id_no_confirm,
            noreputation: res.data.data.count_id_no_reputation
          });
        }
      }
    })

  },


  onShareAppMessage: function () {
    return {
      title: '"' + wx.getStorageSync('mallName') + '" ' + CONFIG.shareProfile,
      path: '/pages/index/index?inviter_id=' + wx.getStorageSync('uid')
    }
  },
  getNotice: function () {
    var that = this;
    WXAPI.noticeList({ pageSize: 5 }).then(function (res) {
      if (res.code == 0) {
        that.setData({
          noticeList: res.data
        });
      }
    })
  },
  toSearch: function () {
    this.setData({
      curPage: 1
    });
    this.getGoodsList(this.data.activeCategoryId);
  },
  onReachBottom: function () {
    this.setData({
      curPage: this.data.curPage + 1
    });
    this.getGoodsList(this.data.activeCategoryId, true)
  },
  onPullDownRefresh: function () {
    this.setData({
      curPage: 1
    });
    this.getGoodsList(this.data.activeCategoryId)
    wx.stopPullDownRefresh()
  },
  // 以下为搜索框事件
  showInput: function () {
    this.setData({
      inputShowed: true
    });
  },
  hideInput: function () {
    this.setData({
      inputVal: "",
      inputShowed: false
    });
  },
  clearInput: function () {
    this.setData({
      inputVal: ""
    });
  },
  inputTyping: function (e) {
    this.setData({
      inputVal: e.detail.value
    });
  },
  // 以下为砍价业务
  kanjiaGoods() {
    const _this = this
    WXAPI.kanjiaList().then(function (res) {
      if (res.code == 0) {
        _this.setData({
          kanjiaList: res.data.result,
          kanjiaGoodsMap: res.data.goodsMap
        })
      }
    })
  },
  goCoupons: function (e) {
    wx.navigateTo({
      url: "/pages/coupons/index"
    })
  },
  pingtuanGoods() { // 获取团购商品列表
    const _this = this
    WXAPI.goods({
      pingtuan: true
    }).then(res => {
      if (res.code === 0) {
        _this.setData({
          pingtuanList: res.data
        })
      }
    })
  }
})
