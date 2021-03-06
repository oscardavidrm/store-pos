import React, {useEffect, useState} from 'react';
import {useDebounce} from 'use-debounce';
import {Card, Col, Row, Typography} from 'antd';
import {connect} from 'react-redux';
import {firestoreConnect} from 'react-redux-firebase';
import {compose} from 'redux';
import PropTypes from 'prop-types';
import {categoriesList} from './demo-data';
import Filters from './components/filters';
import Products from './components/products';
import CheckoutCart from './components/checkout-cart';
import {buildBreadcrumb, fixDecimals} from 'utils/functions';
import {useLocation} from 'react-router-dom';

const {Title} = Typography;

const Checkout = ({products}) => {
  const [useDebt, setUseDebt] = useState(true);
  const [categories, setCategories] = useState([]);
  const [client, setClient] = useState({debt: 0});
  const [cart, setCart] = useState([]);
  const [cartSummary, setCartSummary] = useState({
    subtotal: 0,
    discounts: 0,
    total: 0,
  });
  const [filters, setFilters] = useState({search: '', category: 'Todo'});
  const debouncedFilters = useDebounce(filters, 1000);
  const location = useLocation();

  useEffect(() => {
    // Fetch available categories for store.
    setCategories(categoriesList); // This is the mocked data.
  }, []);

  useEffect(() => {
    // Fetch available products for store.
    // Use variable debouncedFilters to delay request.
    // setProducts(products); // This is the mocked data.
  }, [debouncedFilters]);

  useEffect(() => {
    let subtotal = 0;
    let discounts = 0;
    if (cart.length !== 0) {
      for (const {product, units} of cart) {
        subtotal += product.price * units;
        discounts +=
          (product.hasDiscount ? product.price * product.hasDiscount : 0) *
          units;
      }
    }

    subtotal = fixDecimals(subtotal);
    discounts = fixDecimals(discounts);
    const debt = useDebt ? client.debt : 0;
    const total = fixDecimals(subtotal - discounts + debt);

    setCartSummary({subtotal, discounts, total});
  }, [cart, client, useDebt]);

  const addProductToCart = (productToSet) => {
    let cartToSet;
    if (cart.some(({product}) => product.id === productToSet.id)) {
      cartToSet = cart.map(({product, units}) => {
        if (product.id === productToSet.id) return {product, units: units + 1};
        else return {product, units};
      });
    } else {
      cartToSet = [{product: productToSet, units: 1}, ...cart];
    }

    setCart(cartToSet);
  };

  const modifyProductUnits = (productId, amount) => {
    const cartToSet = [];
    for (const {product, units} of cart) {
      if (product.id === productId) {
        if (amount !== 0) cartToSet.push({product, units: amount});
      } else {
        cartToSet.push({product, units});
      }
    }

    setCart(cartToSet);
  };

  if (products === undefined) {
    return null;
  }
  return (
    <Row>
      <Col span={16} style={{padding: 10}}>
        {buildBreadcrumb(['menu', location.pathname.substring(1)])}
        <Row style={{height: '6vh', marginBottom: 10}}>
          <Filters
            filters={filters}
            setFilters={setFilters}
            categories={categories}
          />
        </Row>
        <Row style={{marginBottom: 10, height: '72vh'}}>
          <Products
            products={products}
            addProductToCart={addProductToCart}
            filters={filters}
          />
        </Row>
        <Row gutter={[15, 15]} style={{height: '15vh'}}>
          <Col span={12}>
            <Card style={{textAlign: 'center', height: '100%'}}>
              <Title strong level={2}>
                AD
              </Title>
            </Card>
          </Col>
          <Col span={12}>
            <Card style={{textAlign: 'center', height: '100%'}}>
              <Title strong level={2}>
                AD
              </Title>
            </Card>
          </Col>
        </Row>
      </Col>
      <Col span={8} style={{height: '100vh'}}>
        <CheckoutCart
          cart={cart}
          cartSummary={cartSummary}
          setCart={setCart}
          client={client}
          useDebt={useDebt}
          addProductToCart={addProductToCart}
          setClient={setClient}
          setUseDebt={setUseDebt}
          modifyProductUnits={modifyProductUnits}
        />
      </Col>
    </Row>
  );
};

Checkout.propTypes = {
  products: PropTypes.array,
};

const mapStateToProps = (state) => {
  return {
    products: state.firestore.ordered.Productos,
    profile: state.firebase.profile,
  };
};

export default compose(
  connect(mapStateToProps),
  firestoreConnect((props) => {
    // if (props.profile.userID === undefined) return [];

    return [
      {
        collection: 'Productos',
        where: ['companyID', '==', 'prueba'],
      },
    ];
  }),
)(Checkout);
