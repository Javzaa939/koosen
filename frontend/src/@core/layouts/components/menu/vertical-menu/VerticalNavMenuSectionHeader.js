// ** Third Party Components

const VerticalNavMenuSectionHeader = ({ item }) => {
  return (
    <li className="navigation-header">
      <span>{item.header}</span>
      <MoreHorizontal className="feather-more-horizontal" />
    </li>
  )
}

export default VerticalNavMenuSectionHeader
